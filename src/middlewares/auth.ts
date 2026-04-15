import { Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { ExtendedRequest } from "../DTOs/user";
import { AuthenticationError, AuthorizationError } from "../utils/errors";
import prisma from "../utils/prisma";

export function authenticate(req: ExtendedRequest, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return next(new AuthenticationError("Token not provided"));
        }

    const decoded = verifyToken(token);

    if (!decoded) {
        return next(new AuthenticationError("Invalid token"));
    }

    req.userId = decoded.userId;

    next();
    } catch (error) {
        next(error);
    }
}
 
export async function roleMiddleware(role: string) {
    return async (req: ExtendedRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            return next(new AuthenticationError("Token not provided"));
        }

        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        if (!user) {
            return next(new AuthenticationError("Invalid token"));
        }

        if (user.role !== role) {
            return next(new AuthorizationError("Unauthorized"));
        }

        next();
    };
}
