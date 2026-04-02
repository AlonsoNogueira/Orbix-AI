import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { meController } from "../modules/user/user-controller";

const router = Router();

router.get("/me", authenticate, meController);

export default router;
