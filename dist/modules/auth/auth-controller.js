"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = loginController;
exports.registerController = registerController;
const auth_service_1 = require("./auth-service");
const sucess_1 = require("../../utils/sucess");
const loginSchema_1 = require("../../schemas/loginSchema");
const registerSchema_1 = require("../../schemas/registerSchema");
async function loginController(request, response, next) {
    try {
        const data = loginSchema_1.loginSchema.parse(request.body);
        const result = await (0, auth_service_1.login)(data.email, data.password);
        (0, sucess_1.sendSuccessResponse)(response, "Login realizado com sucesso", result);
    }
    catch (error) {
        next(error);
    }
}
async function registerController(request, response, next) {
    try {
        const data = registerSchema_1.registerSchema.parse(request.body);
        const result = await (0, auth_service_1.register)(data.email, data.password, data.name, data.cellphone);
        (0, sucess_1.sendSuccessResponse)(response, "Usuário registrado com sucesso", result);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth-controller.js.map