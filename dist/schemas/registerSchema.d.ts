import z from "zod";
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    cellphone: z.ZodString;
}, z.core.$strip>;
