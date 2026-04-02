import prisma from "../../utils/prisma";
import { AuthenticationError, BadRequestError } from "../../utils/errors";

export async function ensureHasCredits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new AuthenticationError("Usuário não encontrado");
  }
  if (user.credit < 1) {
    throw new BadRequestError("Créditos insuficientes");
  }
}
