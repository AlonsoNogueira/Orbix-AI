"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = chatService;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const groq_service_1 = require("../groq/groq-service");
async function chatService(message, userId) {
    //salvar mensagem do usuario
    await prisma_1.default.mensagem.create({
        data: {
            content: message,
            userId,
            author: "USER"
        }
    });
    //buscar mensagens anteriores
    const historico = await prisma_1.default.mensagem.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "asc",
        },
        take: 10,
    });
    const messages = [
        { role: "system", content: "Você é um assistente útil" },
        ...historico.reverse().map((msg) => ({
            role: msg.author === "USER" ? "user" : "assistant",
            content: msg.content,
        })),
    ];
    //enviar para o groq
    const response = await (0, groq_service_1.askGroq)(messages);
    //salvar resposta do groq
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