"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = chatService;
const credit_service_1 = require("../credits/credit-service");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const groq_service_1 = require("../groq/groq-service");
const errors_1 = require("../../utils/errors");
const client_1 = require("@prisma/client");
async function chatService(message, userId) {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new errors_1.AuthenticationError("Usuário não encontrado");
    }
    await (0, credit_service_1.ensureHasCredits)(userId);
    const historico = await prisma_1.default.mensagem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
    });
    const messagesPrevious = historico.reverse().map((msg) => ({
        role: msg.author.toString().toUpperCase() === "USER"
            ? "user"
            : "assistant",
        content: msg.content,
    }));
    const messages = [
        {
            role: "system",
            content: "Você é o OrbixAI, um assistente virtual inteligente e prestativo. Sua prioridade é responder de forma coerente ao que o usuário perguntou agora, levando em conta o histórico da conversa se for relevante. Nunca repita respostas vazias ou fora de contexto.",
        },
        ...messagesPrevious,
        { role: "user", content: message },
    ];
    await prisma_1.default.mensagem.create({
        data: {
            content: message,
            userId,
            author: client_1.AuthorType.USER,
        },
    });
    const response = await (0, groq_service_1.askGroq)(messages);
    await prisma_1.default.$transaction(async (tx) => {
        const updated = await tx.user.updateMany({
            where: { id: userId, credit: { gte: 1 } },
            data: { credit: { decrement: 1 } },
        });
        if (updated.count !== 1) {
            throw new errors_1.BadRequestError("Créditos insuficientes");
        }
        await tx.mensagem.create({
            data: {
                content: response,
                userId,
                author: client_1.AuthorType.ASSISTANT,
            },
        });
    });
    return response;
}
//# sourceMappingURL=chat-service.js.map