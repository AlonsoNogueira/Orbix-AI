import prisma from "../../utils/prisma";
import { askGroq } from "../groq/groq-service";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function chatService(message: string, userId: string) {
    // 1. Buscar histórico ANTES de salvar a nova mensagem pra não ter duplicata no contexto
    const historico = await prisma.mensagem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    // 2. Inverter para ordem cronológica e mapear para o formato do Groq com roles corretas
    const messagesPrevious: Message[] = historico.reverse().map((msg) => ({
        role: msg.author.toString().toUpperCase() === "USER" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
    }));

    // 3. Montar o payload final com System Prompt, Histórico e a Pergunta Atual por último
    const messages: Message[] = [
        { 
            role: "system", 
            content: "Você é o OrbixAI, um assistente virtual inteligente e prestativo. Sua prioridade é responder de forma coerente ao que o usuário perguntou agora, levando em conta o histórico da conversa se for relevante. Nunca repita respostas vazias ou fora de contexto."
        },
        ...messagesPrevious,
        { role: "user", content: message },
    ];

    // 4. Salvar a mensagem atual do usuário no banco
    await prisma.mensagem.create({
        data: {
            content: message,
            userId,
            author: "USER"
        }
    });

    // 5. Enviar para o Groq
    const response = await askGroq(messages);

    // 6. Salvar a resposta do assistente no banco
    await prisma.mensagem.create({
        data: {
            content: response,
            userId,
            author: "ASSISTANT"
        }
    });

    return response;
}