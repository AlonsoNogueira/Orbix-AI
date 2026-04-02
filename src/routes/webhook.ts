import { Request, Response, Router } from "express";
import { handlePaymentWebhook } from "../webhook/paymentWebhook";
import { sendErrorResponse } from "../utils/errors";

const router = Router();

router.post("/abacatepay", async (req: Request, res: Response) => {
  try {
    const raw = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body ?? {});
    await handlePaymentWebhook(raw, req.headers, req.query);
    return res.status(200).json({ received: true });
  } catch (err) {
    sendErrorResponse(res, err as Error);
  }
});

export default router;
