"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaymentWebhook = handlePaymentWebhook;
const node_crypto_1 = __importDefault(require("node:crypto"));
const errors_1 = require("../utils/errors");
const prisma_1 = __importDefault(require("../utils/prisma"));
function timingSafeEqualString(a, b) {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length)
        return false;
    return node_crypto_1.default.timingSafeEqual(ba, bb);
}
function verifySignature(rawBody, headers) {
    const secret = process.env.ABACATE_PAY_KEY;
    if (!secret) {
        throw new errors_1.ValidationError("ABACATE_WEBHOOK_SECRET não configurado");
    }
    const sigHeader = headers["x-webhook-signature"] ||
        headers["x-signature"];
    if (!sigHeader) {
        return false;
    }
    const expectedB64 = node_crypto_1.default
        .createHmac("sha256", secret)
        .update(rawBody, "utf8")
        .digest("base64");
    if (timingSafeEqualString(sigHeader.trim(), expectedB64)) {
        return true;
    }
    const expectedHex = node_crypto_1.default
        .createHmac("sha256", secret)
        .update(rawBody, "utf8")
        .digest("hex");
    return timingSafeEqualString(sigHeader.trim().toLowerCase(), expectedHex);
}
function isUuid(s) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}
function metadataUserId(obj) {
    if (!obj)
        return undefined;
    const m = obj.metadata;
    if (m && typeof m === "object" && m !== null && "userId" in m) {
        const u = m.userId;
        if (typeof u === "string" && u.trim().length > 0)
            return u.trim();
    }
    return undefined;
}
function parseCreditPayload(body) {
    const rootMeta = metadataUserId(body);
    if (body.apiVersion === 2 && typeof body.event === "string") {
        const event = body.event;
        const data = body.data;
        if (!data)
            return null;
        const dataMeta = metadataUserId(data);
        const userFromMeta = rootMeta || dataMeta;
        if (event === "checkout.completed") {
            const checkout = data.checkout;
            if (!checkout || String(checkout.status) !== "PAID")
                return null;
            const ext = checkout.externalId != null && checkout.externalId !== ""
                ? String(checkout.externalId)
                : "";
            const userId = userFromMeta || (isUuid(ext) ? ext : undefined);
            if (!userId)
                return null;
            return {
                externalPaymentId: String(checkout.id),
                amountCents: Number(checkout.paidAmount ?? checkout.amount),
                userId,
            };
        }
        if (event === "transparent.completed") {
            const transparent = data.transparent;
            if (!transparent || String(transparent.status) !== "PAID")
                return null;
            const ext = transparent.externalId != null && transparent.externalId !== ""
                ? String(transparent.externalId)
                : "";
            const userId = userFromMeta || (isUuid(ext) ? ext : undefined);
            if (!userId)
                return null;
            return {
                externalPaymentId: String(transparent.id),
                amountCents: Number(transparent.paidAmount ?? transparent.amount),
                userId,
            };
        }
        return null;
    }
    const id = body.id;
    const status = body.status;
    const amount = body.amount;
    const meta = body.metadata;
    if (typeof id !== "string")
        return null;
    const st = typeof status === "string" ? status.toLowerCase() : "";
    if (st !== "paid")
        return null;
    const userId = meta?.userId || rootMeta;
    if (!userId)
        return null;
    return {
        externalPaymentId: id,
        amountCents: Number(amount),
        userId,
    };
}
async function handlePaymentWebhook(rawBody, headers, query) {
    const querySecret = process.env.WEBHOOK_QUERY_SECRET;
    if (querySecret) {
        const q = query.webhookSecret;
        const received = typeof q === "string" ? q : Array.isArray(q) ? q[0] : undefined;
        if (received !== querySecret) {
            throw new errors_1.ValidationError("Webhook query secret inválido");
        }
    }
    if (!verifySignature(rawBody, headers)) {
        throw new errors_1.ValidationError("Assinatura inválida");
    }
    let body;
    try {
        body = JSON.parse(rawBody);
    }
    catch {
        throw new errors_1.ValidationError("JSON inválido");
    }
    const parsed = parseCreditPayload(body);
    if (!parsed) {
        return;
    }
    const { externalPaymentId, amountCents, userId } = parsed;
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new errors_1.ValidationError("Usuário não encontrado para este pagamento");
    }
    const existingPayment = await prisma_1.default.payment.findUnique({
        where: { externalId: externalPaymentId },
    });
    if (existingPayment) {
        return;
    }
    const amountInReais = amountCents / 100;
    const credits = Math.floor(amountInReais * 5);
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
            data: {
                credit: { increment: credits },
            },
        }),
    ]);
}
//# sourceMappingURL=paymentWebhook.js.map