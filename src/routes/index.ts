import { Router } from "express";
import authRoutes from "./auth";
import chatRoutes from "./chat";
import paymentRoutes from "./payment";
import userRoutes from "./user";

const router = Router();

router.use("/auth", authRoutes);
router.use("/groq", chatRoutes);
router.use("/payment", paymentRoutes);
router.use("/user", userRoutes);

export default router;