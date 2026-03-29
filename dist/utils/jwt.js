"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secret = process.env.JWT_SECRET;
function generateToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn: "1h" });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, secret);
}
//# sourceMappingURL=jwt.js.map