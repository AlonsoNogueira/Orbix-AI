import { Router } from "express";
import authRoutes from "./auth";
import chatRoutes from "./chat";

const router = Router();

router.use("/auth", authRoutes);
router.use("/groq", chatRoutes);

export default router;