import z from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(3),
  // Formato: apenas dígitos, ex: "85999998888" (com DDD, sem máscara)
  cellphone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone deve conter DDD + número (10 ou 11 dígitos)"),
});