import crypto from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import type { Request } from "express";
import { ValidationError } from "../utils/errors";
import prisma from "../utils/prisma";

function timingSafeEqualString(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function verifySignature(rawBody: string, headers: IncomingHttpHeaders): boolean {
  const secret = process.env.ABACATE_PAY_KEY;
  if (!secret) {
    throw new ValidationError("ABACATE_WEBHOOK_SECRET não configurado");
  }

  const sigHeader =
    (headers["x-webhook-signature"] as string | undefined) ||
    (headers["x-signature"] as string | undefined);
  if (!sigHeader) {
    return false;
  }

  const expectedB64 = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  if (timingSafeEqualString(sigHeader.trim(), expectedB64)) {
    return true;
  }

  const expectedHex = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  return timingSafeEqualString(sigHeader.trim().toLowerCase(), expectedHex);
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

function metadataUserId(obj: Record<string, unknown> | undefined): string | undefined {
  if (!obj) return undefined;
  const m = obj.metadata;
  if (m && typeof m === "object" && m !== null && "userId" in m) {
    const u = (m as { userId?: unknown }).userId;
    if (typeof u === "string" && u.trim().length > 0) return u.trim();
  }
  return undefined;
}

type CreditPayload = {
  externalPaymentId: string;
  amountCents: number;
  userId: string;
};

function parseCreditPayload(body: Record<string, unknown>): CreditPayload | null {
  const rootMeta = metadataUserId(body);

  if (body.apiVersion === 2 && typeof body.event === "string") {
    const event = body.event;
    const data = body.data as Record<string, unknown> | undefined;
    if (!data) return null;

    const dataMeta = metadataUserId(data);
    const userFromMeta = rootMeta || dataMeta;

    if (event === "checkout.completed") {
      const checkout = data.checkout as Record<string, unknown> | undefined;
      if (!checkout || String(checkout.status) !== "PAID") return null;
      const ext =
        checkout.externalId != null && checkout.externalId !== ""
          ? String(checkout.externalId)
          : "";
      const userId = userFromMeta || (isUuid(ext) ? ext : undefined);
      if (!userId) return null;
      return {
        externalPaymentId: String(checkout.id),
        amountCents: Number(checkout.paidAmount ?? checkout.amount),
        userId,
      };
    }

    if (event === "transparent.completed") {
      const transparent = data.transparent as Record<string, unknown> | undefined;
      if (!transparent || String(transparent.status) !== "PAID") return null;
      const ext =
        transparent.externalId != null && transparent.externalId !== ""
          ? String(transparent.externalId)
          : "";
      const userId = userFromMeta || (isUuid(ext) ? ext : undefined);
      if (!userId) return null;
      return {
        externalPaymentId: String(transparent.id),
        amountCents: Number(transparent.paidAmount ?? transparent.amount),
        userId,
      };
    }

    return null;
  }

  const id = body.id;
  const status = body.status;
  const amount = body.amount;
  const meta = body.metadata as { userId?: string } | undefined;

  if (typeof id !== "string") return null;
  const st = typeof status === "string" ? status.toLowerCase() : "";
  if (st !== "paid") return null;

  const userId = meta?.userId || rootMeta;
  if (!userId) return null;

  return {
    externalPaymentId: id,
    amountCents: Number(amount),
    userId,
  };
}

export async function handlePaymentWebhook(
  rawBody: string,
  headers: IncomingHttpHeaders,
  query: Request["query"],
): Promise<void> {
  const querySecret = process.env.WEBHOOK_QUERY_SECRET;
  if (querySecret) {
    const q = query.webhookSecret;
    const received = typeof q === "string" ? q : Array.isArray(q) ? q[0] : undefined;
    if (received !== querySecret) {
      throw new ValidationError("Webhook query secret inválido");
    }
  }

  if (!verifySignature(rawBody, headers)) {
    throw new ValidationError("Assinatura inválida");
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    throw new ValidationError("JSON inválido");
  }

  const parsed = parseCreditPayload(body);
  if (!parsed) {
    return;
  }

  const { externalPaymentId, amountCents, userId } = parsed;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ValidationError("Usuário não encontrado para este pagamento");
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { externalId: externalPaymentId },
  });

  if (existingPayment) {
    return;
  }

  const amountInReais = amountCents / 100;
  const credits = Math.floor(amountInReais * 5);

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        externalId: externalPaymentId,
        amount: amountCents,
        status: "PAID",
        credit_amount: credits,
        userId,
        type: "CREDIT",
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        credit: { increment: credits },
      },
    }),
  ]);
}
