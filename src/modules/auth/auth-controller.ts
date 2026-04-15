import { Response, NextFunction } from "express";
import { login, register } from "./auth-service";
import { sendSuccessResponse } from "../../utils/sucess";
import { ExtendedRequest } from "../../DTOs/user";
import { loginSchema } from "../../schemas/loginSchema";
import { registerSchema } from "../../schemas/registerSchema";

export async function loginController(
  request: ExtendedRequest,
  response: Response,
  next: NextFunction,
) {
  try {
    const data = loginSchema.parse(request.body);
    const result = await login(data.email, data.password);
    sendSuccessResponse(response, "Login realizado com sucesso", result);
  } catch (error) {
    next(error);
  }
}

export async function registerController(
  request: ExtendedRequest,
  response: Response,
  next: NextFunction,
) {
  try {
    const data = registerSchema.parse(request.body);
    const result = await register(data.email, data.password, data.name, data.cellphone);
    sendSuccessResponse(response, "Usuário registrado com sucesso", result);
  } catch (error) {
    next(error);
  }
}