"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const user_controller_1 = require("../modules/user/user-controller");
const router = (0, express_1.Router)();
router.get("/me", auth_1.authenticate, user_controller_1.meController);
exports.default = router;
//# sourceMappingURL=user.js.map