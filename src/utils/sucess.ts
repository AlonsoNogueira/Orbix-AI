import { ApiResponse } from "../DTOs/response";
import { Response } from "express";

export function sendSuccessResponse<T>(
    res: Response,
    message?: string,
    data?: T,
    statusCode: number = 200
): void {
    const response: ApiResponse<T> = {
        success: true,
        data,
    };
    if (message !== undefined) {
        response.message = message;
    }
    res.status(statusCode).json(response);
}