import { JwtPayload } from "../DTOs/jwt";
export declare function generateToken(userId: string): string;
export declare function verifyToken(token: string): JwtPayload;
