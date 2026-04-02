import { ensureHasCredits } from "../credits/credit-service";
import prisma from "../../utils/prisma";
import { askGroq } from "../groq/groq-service";
import { AuthenticationError, BadRequestError } from "../../utils/errors";
import { AuthorType } from "@prisma/client";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function chatService(message: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new AuthenticationError("Usuário não encontrado");
  }

  await ensureHasCredits(userId);

  const historico = await prisma.mensagem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const messagesPrevious: Message[] = historico.reverse().map((msg) => ({
    role:
      msg.author.toString().toUpperCase() === "USER"
        ? ("user" as const)
        : ("assistant" as const),
    content: msg.content,
  }));

  const messages: Message[] = [
    {
      role: "system",
      content:
        "Você é o OrbixAI, um assistente virtual inteligente e prestativo. Sua prioridade é responder de forma coerente ao que o usuário perguntou agora, levando em conta o histórico da conversa se for relevante. Nunca repita respostas vazias ou fora de contexto.",
    },
    ...messagesPrevious,
    { role: "user", content: message },
  ];

  await prisma.mensagem.create({
    data: {
      content: message,
      userId,
      author: AuthorType.USER,
    },
  });

  const response = await askGroq(messages);

  await prisma.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({
      where: { id: userId, credit: { gte: 1 } },
      data: { credit: { decrement: 1 } },
    });
    if (updated.count !== 1) {
      throw new BadRequestError("Créditos insuficientes");
    }
    await tx.mensagem.create({
      data: {
        content: response,
        userId,
        author: AuthorType.ASSISTANT,
      },
    });
  });

  return response;
}
