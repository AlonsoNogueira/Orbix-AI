import { Response } from "express";
export declare function sendSuccessResponse<T>(res: Response, message?: string, data?: T, statusCode?: number): void;
