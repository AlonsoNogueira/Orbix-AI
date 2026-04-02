"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutSchema = void 0;
const zod_1 = require("zod");
exports.checkoutSchema = zod_1.z.object({
    amountCents: zod_1.z.number().int().min(100).max(1_000_000).optional(),
});
//# sourceMappingURL=checkoutSchema.js.map