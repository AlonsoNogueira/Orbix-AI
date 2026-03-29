import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../../DTOs/user";
export declare function loginController(request: ExtendedRequest, response: Response, next: NextFunction): Promise<void>;
export declare function registerController(request: ExtendedRequest, response: Response, next: NextFunction): Promise<void>;
