"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutController = createCheckoutController;
const sucess_1 = require("../../utils/sucess");
const checkoutSchema_1 = require("../../schemas/checkoutSchema");
const payment_service_1 = require("./payment-service");
const errors_1 = require("../../utils/errors");
const DEFAULT_AMOUNT_CENTS = 1000;
async function createCheckoutController(request, response, next) {
    try {
        const parsed = checkoutSchema_1.checkoutSchema.safeParse(request.body ?? {});
        if (!parsed.success) {
            throw new errors_1.BadRequestError("amountCents deve ser um inteiro entre 100 e 1000000");
        }
        const amountCents = parsed.data.amountCents ?? DEFAULT_AMOUNT_CENTS;
        const userId = request.userId;
        const result = await (0, payment_service_1.createBillingCheckout)(userId, amountCents);
        (0, sucess_1.sendSuccessResponse)(response, "Cobrança criada", result);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=payment-controller.js.map