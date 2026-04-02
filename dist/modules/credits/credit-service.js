"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureHasCredits = ensureHasCredits;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const errors_1 = require("../../utils/errors");
async function ensureHasCredits(userId) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new errors_1.AuthenticationError("Usuário não encontrado");
    }
    if (user.credit < 1) {
        throw new errors_1.BadRequestError("Créditos insuficientes");
    }
}
//# sourceMappingURL=credit-service.js.map