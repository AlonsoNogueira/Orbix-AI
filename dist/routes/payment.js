"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const payment_controller_1 = require("../modules/payment/payment-controller");
const router = (0, express_1.Router)();
router.post("/checkout", auth_1.authenticate, payment_controller_1.createCheckoutController);
exports.default = router;
//# sourceMappingURL=payment.js.map