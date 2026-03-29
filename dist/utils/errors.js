"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.AppError = void 0;
exports.sendErrorResponse = sendErrorResponse;
class AppError extends Error {
    statusCode;
    code;
    isOperational;
    constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class AuthenticationError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401, "AUTHENTICATION_ERROR");
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = "Acess denied") {
        super(message, 403, "AUTHORIZATION_ERROR");
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(resource = "Resource") {
        super(resource, 404, "NOT_FOUND");
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(message, 409, "CONFLICT");
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends AppError {
    details;
    constructor(message, details) {
        super(message, 400, "VALIDATION_ERROR");
        this.details = details;
    }
}
exports.ValidationError = ValidationError;
class BadRequestError extends AppError {
    constructor(message) {
        super(message, 400, "BAD_REQUEST");
    }
}
exports.BadRequestError = BadRequestError;
function sendErrorResponse(res, error) {
    if (error instanceof AppError) {
        const response = {
            success: false,
            error: error.code,
            message: error.message,
            details: error.details,
        };
        res.status(error.statusCode).json(response);
    }
    else {
        const response = {
            success: false,
            error: "INTERNAL_ERROR",
            message: "Internal error",
        };
        res.status(500).json(response);
    }
}
//# sourceMappingURL=errors.js.map