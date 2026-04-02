"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBillingCheckout = createBillingCheckout;
const errors_1 = require("../../utils/errors");
const ABACATE_API = "https://api.abacatepay.com/v1";
async function createBillingCheckout(userId, amountCents) {
    const apiKey = process.env.ABACATEPAY_API_KEY;
    if (!apiKey) {
        throw new errors_1.BadRequestError("Pagamentos não configurados no servidor (ABACATEPAY_API_KEY)");
    }
    const frontendBase = (process.env.FRONTEND_URL || "http://localhost:8080").replace(/\/$/, "");
    if (amountCents < 100) {
        throw new errors_1.BadRequestError("Valor mínimo é R$ 1,00 (100 centavos)");
    }
    const payload = {
        frequency: "ONE_TIME",
        methods: ["PIX", "CARD"],
        products: [
            {
                externalId: `orbixai-credits-${userId}`,
                name: "Créditos OrbixAI",
                description: "Pacote de créditos para uso no chat",
                quantity: 1,
                price: amountCents,
            },
        ],
        returnUrl: frontendBase,
        completionUrl: `${frontendBase}/payment/success`,
        externalId: userId,
        metadata: { userId },
    };
    const res = await fetch(`${ABACATE_API}/billing/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
    });
    const json = (await res.json());
    if (!res.ok || json.error) {
        const msg = (typeof json.error === "string" && json.error) ||
            json.message ||
            "Falha ao criar cobrança na AbacatePay";
        throw new errors_1.BadRequestError(msg);
    }
    const url = json.data?.url;
    if (!url) {
        throw new errors_1.BadRequestError("Resposta da AbacatePay sem URL de pagamento");
    }
    return { url };
}
//# sourceMappingURL=payment-service.js.map