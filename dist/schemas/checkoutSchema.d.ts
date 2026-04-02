import { z } from "zod";
export declare const checkoutSchema: z.ZodObject<{
    amountCents: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
