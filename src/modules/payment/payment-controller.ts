import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../../DTOs/user";
import { sendSuccessResponse } from "../../utils/sucess";
import { checkoutSchema } from "../../schemas/checkoutSchema"; 
import { createBillingCheckout } from "./payment-service";
import { BadRequestError } from "../../utils/errors";

const DEFAULT_AMOUNT_CENTS = 1000;

export async function createCheckoutController(
  request: ExtendedRequest,
  response: Response,
  next: NextFunction,
) {
  try {
    const parsed = checkoutSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      throw new BadRequestError("amountCents deve ser um inteiro entre 100 e 1000000");
    }
    const amountCents = parsed.data.amountCents ?? DEFAULT_AMOUNT_CENTS;

    const userId = request.userId as string;
    const result = await createBillingCheckout(userId, amountCents);
    sendSuccessResponse(response, "Cobrança criada", result);
  } catch (error) {
    next(error);
  }
}
