import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../../DTOs/user";
export declare function meController(request: ExtendedRequest, response: Response, next: NextFunction): Promise<void>;
