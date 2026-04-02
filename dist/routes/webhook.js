"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentWebhook_1 = require("../webhook/paymentWebhook");
const errors_1 = require("../utils/errors");
const router = (0, express_1.Router)();
router.post("/abacatepay", async (req, res) => {
    try {
        const raw = Buffer.isBuffer(req.body)
            ? req.body.toString("utf8")
            : typeof req.body === "string"
                ? req.body
                : JSON.stringify(req.body ?? {});
        await (0, paymentWebhook_1.handlePaymentWebhook)(raw, req.headers, req.query);
        return res.status(200).json({ received: true });
    }
    catch (err) {
        (0, errors_1.sendErrorResponse)(res, err);
    }
});
exports.default = router;
//# sourceMappingURL=webhook.js.map