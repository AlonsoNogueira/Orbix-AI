import { Response } from "express";
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare class ValidationError extends AppError {
    details: any;
    constructor(message: string, details?: any);
}
export declare class BadRequestError extends AppError {
    constructor(message: string);
}
export declare function sendErrorResponse(res: Response, error: AppError | Error): void;
