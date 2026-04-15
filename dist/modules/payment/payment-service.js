"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcCredits = calcCredits;
exports.createBillingCheckout = createBillingCheckout;
const errors_1 = require("../../utils/errors");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const ABACATE_API = "https://api.abacatepay.com/v1";
/** Regra de negócio: R$ 1,00 = 5 créditos */
function calcCredits(amountCents) {
    return Math.floor((amountCents / 100) * 5);
}
async function createBillingCheckout(userId, amountCents, extras = {}) {
    const apiKey = process.env.ABACATE_PAY_KEY;
    if (!apiKey) {
        throw new errors_1.BadRequestError("Pagamentos não configurados no servidor (ABACATE_PAY_KEY)");
    }
    if (amountCents < 100) {
        throw new errors_1.BadRequestError("Valor mínimo é R$ 1,00 (100 centavos)");
    }
    // Busca usuário atual
    let user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true, cellphone: true, taxId: true },
    });
    if (!user) {
        throw new errors_1.BadRequestError("Usuário não encontrado");
    }
    // Se vieram novos dados de cellphone/taxId, persiste no banco para próximas compras
    const cellphone = extras.cellphone?.replace(/\D/g, "") || user.cellphone;
    const taxId = extras.taxId?.replace(/\D/g, "") || user.taxId;
    if (!cellphone)
        throw new errors_1.BadRequestError("Telefone é obrigatório para pagamento");
    if (!taxId)
        throw new errors_1.BadRequestError("CPF/CNPJ é obrigatório para pagamento");
    if ((extras.cellphone && extras.cellphone !== user.cellphone) ||
        (extras.taxId && extras.taxId !== user.taxId)) {
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                ...(extras.cellphone ? { cellphone } : {}),
                ...(extras.taxId ? { taxId } : {}),
            },
        });
    }
    const frontendBase = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
    // Cada compra precisa de um ID único — sem isso a AbacatePay reutiliza
    // o link antigo (já pago/expirado) e exibe "Não encontramos este link"
    const purchaseId = `${userId}-${Date.now()}`;
    const payload = {
        frequency: "ONE_TIME",
        methods: ["PIX"],
        products: [
            {
                externalId: purchaseId,
                name: "Créditos OrbixAI",
                description: `Pacote de ${calcCredits(amountCents)} créditos para uso no chat`,
                quantity: 1,
                price: amountCents,
            },
        ],
        // Todos os campos obrigatórios pela AbacatePay
        customer: {
            name: user.name || user.email.split("@")[0],
            email: user.email,
            cellphone,
            taxId,
        },
        externalId: purchaseId,
        metadata: { userId },
        returnUrl: `${frontendBase}/payment/success`,
        completionUrl: `${frontendBase}/payment/success`,
    };
    let res;
    try {
        res = await fetch(`${ABACATE_API}/billing/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
        });
    }
    catch {
        throw new errors_1.BadRequestError("Não foi possível conectar à AbacatePay. Verifique sua conexão.");
    }
    let json;
    try {
        json = (await res.json());
    }
    catch {
        throw new errors_1.BadRequestError("Resposta inválida da AbacatePay");
    }
    if (!res.ok || json.error) {
        const msg = (typeof json.error === "string" && json.error) ||
            json.message ||
            `Falha ao criar cobrança (HTTP ${res.status})`;
        throw new errors_1.BadRequestError(msg);
    }
    const url = json.data?.url;
    if (!url) {
        throw new errors_1.BadRequestError("AbacatePay não retornou URL de pagamento");
    }
    return { url, credits: calcCredits(amountCents), amountCents };
}
//# sourceMappingURL=payment-service.js.map