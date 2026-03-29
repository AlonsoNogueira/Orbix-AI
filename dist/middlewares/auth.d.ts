import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../DTOs/user";
export declare function authenticate(req: ExtendedRequest, res: Response, next: NextFunction): void;
export declare function roleMiddleware(role: string): Promise<(req: ExtendedRequest, res: Response, next: NextFunction) => Promise<void>>;
