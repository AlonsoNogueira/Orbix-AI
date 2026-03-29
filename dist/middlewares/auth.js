"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.roleMiddleware = roleMiddleware;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const prisma_1 = __importDefault(require("../utils/prisma"));
function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return next(new errors_1.AuthenticationError("Token not provided"));
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded) {
            return next(new errors_1.AuthenticationError("Invalid token"));
        }
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        next(error);
    }
}
async function roleMiddleware(role) {
    return async (req, res, next) => {
        if (!req.userId) {
            return next(new errors_1.AuthenticationError("Token not provided"));
        }
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: req.userId,
            },
        });
        if (!user) {
            return next(new errors_1.AuthenticationError("Invalid token"));
        }
        if (user.role !== role) {
            return next(new errors_1.AuthorizationError("Unauthorized"));
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map