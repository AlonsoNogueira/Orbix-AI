import { Router } from "express";
import { chatController } from "../modules/chat/chat-controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/chat", authenticate, chatController);

export default router;