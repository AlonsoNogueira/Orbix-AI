import { z } from "zod";

export const checkoutSchema = z.object({
  amountCents: z.number().int().min(100).max(1_000_000).optional(),
  // Enviados apenas se ainda não estiverem salvos no banco
  cellphone: z.string().optional(),
  taxId: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;