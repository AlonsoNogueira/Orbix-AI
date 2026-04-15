"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
const jwt_1 = require("../../utils/jwt");
const user_service_1 = require("../user/user-service");
const bcrypt_1 = require("bcrypt");
const errors_1 = require("../../utils/errors");
const prisma_1 = __importDefault(require("../../utils/prisma"));
async function login(email, password) {
    const user = await (0, user_service_1.findUserByEmail)(email, true);
    if (!user) {
        throw new errors_1.AuthenticationError("Credenciais inválidas");
    }
    const isPasswordValid = await (0, bcrypt_1.compare)(password, user.password);
    if (!isPasswordValid) {
        throw new errors_1.AuthenticationError("Credenciais inválidas");
    }
    const token = (0, jwt_1.generateToken)(user.id);
    return { token };
}
async function register(email, password, name, cellphone) {
    const existing = await (0, user_service_1.findUserByEmail)(email, false);
    if (existing) {
        throw new errors_1.ConflictError("E-mail já cadastrado");
    }
    const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
    const newUser = await prisma_1.default.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            cellphone,
        },
    });
    const token = (0, jwt_1.generateToken)(newUser.id);
    return { token };
}
//# sourceMappingURL=auth-service.js.map