import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../../DTOs/user";
import { sendSuccessResponse } from "../../utils/sucess";
import { findUserById } from "./user-service";
import { AuthenticationError } from "../../utils/errors";

export async function meController(
  request: ExtendedRequest,
  response: Response,
  next: NextFunction,
) {
  try {
    const userId = request.userId as string;
    const user = await findUserById(userId, false);
    if (!user) {
      throw new AuthenticationError("Usuário não encontrado");
    }
    sendSuccessResponse(response, undefined, {
      id: user.id,
      email: user.email,
      name: user.name,
      credit: user.credit,
    });
  } catch (error) {
    next(error);
  }
}
