import prisma from "../../utils/prisma";
import { askGroq } from "../groq/groq-service";

export async function chatService(message: string, userId: string) {
    //salvar mensagem do usuario
    await prisma.mensagem.create({
    data: {
        content: message,
        userId,
        author: "USER"
    }
   })

   //buscar mensagens anteriores
   const historico = await prisma.mensagem.findMany({
    where: {
        userId,
    },
    orderBy: {
        createdAt: "asc",
    },
    take: 10,
   })

   type Message = {
     role: "user" | "assistant" | "system";
     content: string;
   };

   const messages: Message[] = [
     { role: "system", content: "Você é um assistente útil" },
     ...historico.reverse().map((msg) => ({
       role: msg.author === "USER" ? ("user" as const) : ("assistant" as const),
       content: msg.content,
     })),
   ];

   //enviar para o groq
   const response = await askGroq(messages);

   //salvar resposta do groq
   await prisma.mensagem.create({
    data: {
        content: response,
        userId,
        author: "ASSISTANT"
    }
   })

   return response;
}