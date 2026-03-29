"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccessResponse = sendSuccessResponse;
function sendSuccessResponse(res, message, data, statusCode = 200) {
    const response = {
        success: true,
        data,
    };
    if (message !== undefined) {
        response.message = message;
    }
    res.status(statusCode).json(response);
}
//# sourceMappingURL=sucess.js.map