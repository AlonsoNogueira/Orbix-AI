"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutSchema = void 0;
const zod_1 = require("zod");
exports.checkoutSchema = zod_1.z.object({
    amountCents: zod_1.z.number().int().min(100).max(1_000_000).optional(),
    // Enviados apenas se ainda não estiverem salvos no banco
    cellphone: zod_1.z.string().optional(),
    taxId: zod_1.z.string().optional(),
});
//# sourceMappingURL=checkoutSchema.js.map