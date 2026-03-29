import jwt from "jsonwebtoken";
import { JwtPayload } from "../DTOs/jwt"

const secret = process.env.JWT_SECRET as string;

export function generateToken(userId: string) {
    return jwt.sign({ userId }, secret, { expiresIn: "1h" });
}

export function verifyToken(token: string) {
    return jwt.verify(token, secret) as JwtPayload;
}