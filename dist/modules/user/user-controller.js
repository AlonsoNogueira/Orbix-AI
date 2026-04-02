"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meController = meController;
const sucess_1 = require("../../utils/sucess");
const user_service_1 = require("./user-service");
const errors_1 = require("../../utils/errors");
async function meController(request, response, next) {
    try {
        const userId = request.userId;
        const user = await (0, user_service_1.findUserById)(userId, false);
        if (!user) {
            throw new errors_1.AuthenticationError("Usuário não encontrado");
        }
        (0, sucess_1.sendSuccessResponse)(response, undefined, {
            id: user.id,
            email: user.email,
            name: user.name,
            credit: user.credit,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=user-controller.js.map