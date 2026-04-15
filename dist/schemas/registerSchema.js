"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.registerSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(6),
    name: zod_1.default.string().min(3),
    // Formato: apenas dígitos, ex: "85999998888" (com DDD, sem máscara)
    cellphone: zod_1.default
        .string()
        .regex(/^\d{10,11}$/, "Telefone deve conter DDD + número (10 ou 11 dígitos)"),
});
//# sourceMappingURL=registerSchema.js.map