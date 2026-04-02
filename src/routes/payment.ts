import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { createCheckoutController } from "../modules/payment/payment-controller";

const router = Router();

router.post("/checkout", authenticate, createCheckoutController);

export default router;
