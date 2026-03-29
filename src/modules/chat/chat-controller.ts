import { Response } from "express";
import { ExtendedRequest } from "../../DTOs/user";
import { chatService } from "./chat-service";
import { sendSuccessResponse } from "../../utils/sucess";

export async function chatController(request: ExtendedRequest, response: Response) {
    const { message } = request.body;
    const userId = request.userId as string;

    const result = await chatService(message, userId);

    return sendSuccessResponse(response, "Mensagem enviada com sucesso", result);
}