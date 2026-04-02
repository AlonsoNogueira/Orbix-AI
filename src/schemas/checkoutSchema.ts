import { z } from "zod";

export const checkoutSchema = z.object({
  amountCents: z.number().int().min(100).max(1_000_000).optional(),
});
