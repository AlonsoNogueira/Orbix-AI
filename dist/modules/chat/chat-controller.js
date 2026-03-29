"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = chatController;
const chat_service_1 = require("./chat-service");
const sucess_1 = require("../../utils/sucess");
async function chatController(request, response) {
    const { message } = request.body;
    const userId = request.userId;
    const result = await (0, chat_service_1.chatService)(message, userId);
    return (0, sucess_1.sendSuccessResponse)(response, "Mensagem enviada com sucesso", result);
}
//# sourceMappingURL=chat-controller.js.map