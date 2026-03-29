import { ApiResponse } from "../DTOs/response";
import { Response } from "express";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Acess denied") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(resource, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class ValidationError extends AppError {
  public details: any;
  constructor(message: string, details?: any) {
    super(message, 400, "VALIDATION_ERROR");
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400, "BAD_REQUEST");
  }
}

export function sendErrorResponse(
  res: Response,
  error: AppError | Error,
): void {
  if (error instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: error.code,
      message: error.message,
      details: (error as any).details,
    };

    res.status(error.statusCode).json(response);
  } else {
    const response: ApiResponse = {
      success: false,
      error: "INTERNAL_ERROR",
      message: "Internal error",
    };

    res.status(500).json(response);
  }
}
