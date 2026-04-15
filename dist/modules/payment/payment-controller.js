"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutController = createCheckoutController;
const sucess_1 = require("../../utils/sucess");
const checkoutSchema_1 = require("../../schemas/checkoutSchema");
const payment_service_1 = require("./payment-service");
const errors_1 = require("../../utils/errors");
async function createCheckoutController(request, response, next) {
    try {
        const parsed = checkoutSchema_1.checkoutSchema.safeParse(request.body ?? {});
        if (!parsed.success) {
            throw new errors_1.BadRequestError("Dados inválidos: " + parsed.error.issues[0]?.message);
        }
        const { amountCents = 100, cellphone, taxId } = parsed.data;
        const userId = request.userId;
        const result = await (0, payment_service_1.createBillingCheckout)(userId, amountCents, { cellphone, taxId });
        (0, sucess_1.sendSuccessResponse)(response, "Cobrança criada com sucesso", {
            url: result.url,
            credits: result.credits,
            amountCents: result.amountCents,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=payment-controller.js.map