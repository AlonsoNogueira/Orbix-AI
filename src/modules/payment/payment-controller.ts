import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../../DTOs/user";
import { sendSuccessResponse } from "../../utils/sucess";
import { checkoutSchema } from "../../schemas/checkoutSchema";
import { createBillingCheckout } from "./payment-service";
import { BadRequestError } from "../../utils/errors";

export async function createCheckoutController(
  request: ExtendedRequest,
  response: Response,
  next: NextFunction,
) {
  try {
    const parsed = checkoutSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      throw new BadRequestError("Dados inválidos: " + parsed.error.issues[0]?.message);
    }

    const { amountCents = 100, cellphone, taxId } = parsed.data;
    const userId = request.userId as string;

    const result = await createBillingCheckout(userId, amountCents, { cellphone, taxId });

    sendSuccessResponse(response, "Cobrança criada com sucesso", {
      url: result.url,
      credits: result.credits,
      amountCents: result.amountCents,
    });
  } catch (error) {
    next(error);
  }
}