"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.findAll = findAll;
const prisma_1 = __importDefault(require("../../utils/prisma"));
async function findUserByEmail(email, includePassword) {
    return prisma_1.default.user.findUnique({
        where: {
            email,
        },
        omit: {
            password: !includePassword,
        },
    });
}
async function findUserById(userId, includePassword) {
    return prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
        omit: {
            password: !includePassword,
        },
    });
}
async function findAll(includePassword) {
    return prisma_1.default.user.findMany({
        omit: { password: !includePassword },
    });
}
//# sourceMappingURL=user-service.js.map