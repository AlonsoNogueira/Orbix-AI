"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaymentWebhook = handlePaymentWebhook;
const node_crypto_1 = __importDefault(require("node:crypto"));
const errors_1 = require("../utils/errors");
const prisma_1 = __importDefault(require("../utils/prisma"));
const payment_service_1 = require("../modules/payment/payment-service");
// ─── Verificação HMAC (X-Webhook-Signature) ─────────────────────────────────
// A AbacatePay assina o rawBody com HMAC-SHA256 usando a chave pública fixa
// e inclui a assinatura base64 no header X-Webhook-Signature.
// Ref: https://docs.abacatepay.com/pages/webhooks
const ABACATEPAY_PUBLIC_KEY = "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";
function verifySignature(rawBody, headers) {
    const signature = headers["x-webhook-signature"];
    if (!signature) {
        throw new errors_1.ValidationError("Header X-Webhook-Signature ausente");
    }
    const expected = node_crypto_1.default
        .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
        .update(rawBody, "utf8")
        .digest("base64");
    const sigBuf = Buffer.from(signature.trim(), "utf8");
    const expectedBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expectedBuf.length ||
        !node_crypto_1.default.timingSafeEqual(sigBuf, expectedBuf)) {
        throw new errors_1.ValidationError("Assinatura do webhook inválida");
    }
}
function parseCreditPayload(body) {
    // Ignora eventos que não sejam checkout.completed
    if (body.event !== "checkout.completed")
        return null;
    const data = body.data;
    const checkout = data?.checkout;
    if (!checkout)
        return null;
    // Só processa se o status for PAID
    if (String(checkout.status).toUpperCase() !== "PAID")
        return null;
    // userId vem sempre do metadata — externalId agora é `${userId}-${timestamp}`
    const metadata = checkout.metadata;
    const userId = metadata?.userId ?? "";
    if (!userId) {
        console.warn("[Webhook] userId não encontrado no payload:", JSON.stringify(checkout).slice(0, 200));
        return null;
    }
    const externalPaymentId = String(checkout.id ?? "").trim();
    if (!externalPaymentId)
        return null;
    const amountCents = Number(checkout.paidAmount ?? checkout.amount ?? 0);
    if (amountCents < 100)
        return null;
    return { externalPaymentId, amountCents, userId };
}
function isUuid(s) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}
// ─── Handler principal ────────────────────────────────────────────────────────
async function handlePaymentWebhook(rawBody, headers, _query) {
    verifySignature(rawBody, headers);
    let body;
    try {
        body = JSON.parse(rawBody);
    }
    catch {
        throw new errors_1.ValidationError("Corpo do webhook não é JSON válido");
    }
    console.log(`[Webhook] Evento: ${body.event} | apiVersion: ${body.apiVersion}`);
    const parsed = parseCreditPayload(body);
    if (!parsed)
        return; // evento ignorado (ex: checkout.disputed)
    const { externalPaymentId, amountCents, userId } = parsed;
    // Idempotência: não processa o mesmo pagamento duas vezes
    const existing = await prisma_1.default.payment.findUnique({ where: { externalId: externalPaymentId } });
    if (existing) {
        console.log(`[Webhook] Pagamento já processado: ${externalPaymentId}`);
        return;
    }
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new errors_1.ValidationError(`Usuário não encontrado: ${userId}`);
    const credits = (0, payment_service_1.calcCredits)(amountCents);
    console.log(`[Webhook] +${credits} créditos → ${user.email} (R$ ${(amountCents / 100).toFixed(2)})`);
    await prisma_1.default.$transaction([
        prisma_1.default.payment.create({
            data: {
                externalId: externalPaymentId,
                amount: amountCents,
                status: "PAID",
                credit_amount: credits,
                userId,
                type: "CREDIT",
            },
        }),
        prisma_1.default.user.update({
            where: { id: userId },
            data: { credit: { increment: credits } },
        }),
    ]);
    console.log(`[Webhook] ✅ Concluído: ${credits} créditos adicionados para ${user.email}`);
}
//# sourceMappingURL=paymentWebhook.js.map