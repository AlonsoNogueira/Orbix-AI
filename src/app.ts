import express from "express";
import cors from "cors";
import "dotenv/config";
import router from "./routes";
import webhookRoutes from "./routes/webhook";

const app = express();

app.use(cors());

app.use(
  "/api/webhook",
  express.raw({ type: "*/*" }),
  webhookRoutes,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;