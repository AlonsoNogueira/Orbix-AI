import { z } from "zod";
export declare const checkoutSchema: z.ZodObject<{
    amountCents: z.ZodOptional<z.ZodNumber>;
    cellphone: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
