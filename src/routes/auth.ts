import { Router } from "express";
import { loginController, registerController } from "../modules/auth/auth-controller";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);

export default router;