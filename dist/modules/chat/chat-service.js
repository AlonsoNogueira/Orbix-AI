"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = chatService;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const groq_service_1 = require("../groq/groq-service");
async function chatService(message, userId) {
    // 1. Buscar histórico ANTES de salvar a nova mensagem pra não ter duplicata no contexto
    const historico = await prisma_1.default.mensagem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
    });
    // 2. Inverter para ordem cronológica e mapear para o formato do Groq com roles corretas
    const messagesPrevious = historico.reverse().map((msg) => ({
        role: msg.author.toString().toUpperCase() === "USER" ? "user" : "assistant",
        content: msg.content,
    }));
    // 3. Montar o payload final com System Prompt, Histórico e a Pergunta Atual por último
    const messages = [
        {
            role: "system",
            content: "Você é o OrbixAI, um assistente virtual inteligente e prestativo. Sua prioridade é responder de forma coerente ao que o usuário perguntou agora, levando em conta o histórico da conversa se for relevante. Nunca repita respostas vazias ou fora de contexto."
        },
        ...messagesPrevious,
        { role: "user", content: message },
    ];
    // 4. Salvar a mensagem atual do usuário no banco
    await prisma_1.default.mensagem.create({
        data: {
            content: message,
            userId,
            author: "USER"
        }
    });
    // 5. Enviar para o Groq
    const response = await (0, groq_service_1.askGroq)(messages);
    // 6. Salvar a resposta do assistente no banco
    await prisma_1.default.mensagem.create({
        data: {
            content: response,
            userId,
            author: "ASSISTANT"
        }
    });
    return response;
}
//# sourceMappingURL=chat-service.js.map