import crypto from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import type { Request } from "express";
import { ValidationError } from "../utils/errors";
import prisma from "../utils/prisma";
import { calcCredits } from "../modules/payment/payment-service";


const ABACATEPAY_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

function verifySignature(rawBody: string, headers: IncomingHttpHeaders): void {
  const signature = headers["x-webhook-signature"] as string | undefined;

  if (!signature) {
    throw new ValidationError("Header X-Webhook-Signature ausente");
  }

  const expected = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(rawBody, "utf8")
    .digest("base64");

  const sigBuf      = Buffer.from(signature.trim(), "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");

  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    throw new ValidationError("Assinatura do webhook inválida");
  }
}


interface CreditPayload {
  externalPaymentId: string;
  amountCents: number;
  userId: string;
}

function parseCreditPayload(body: Record<string, unknown>): CreditPayload | null {
  // Ignora eventos que não sejam checkout.completed
  if (body.event !== "checkout.completed") return null;

  const data     = body.data     as Record<string, unknown> | undefined;
  const checkout = data?.checkout as Record<string, unknown> | undefined;

  if (!checkout) return null;

  // Só processa se o status for PAID
  if (String(checkout.status).toUpperCase() !== "PAID") return null;

  // userId vem sempre do metadata — externalId agora é `${userId}-${timestamp}`
  const metadata = checkout.metadata as { userId?: string } | undefined;
  const userId   = metadata?.userId ?? "";

  if (!userId) {
    console.warn("[Webhook] userId não encontrado no payload:", JSON.stringify(checkout).slice(0, 200));
    return null;
  }

  const externalPaymentId = String(checkout.id ?? "").trim();
  if (!externalPaymentId) return null;

  const amountCents = Number(checkout.paidAmount ?? checkout.amount ?? 0);
  if (amountCents < 100) return null;

  return { externalPaymentId, amountCents, userId };
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function handlePaymentWebhook(
  rawBody: string,
  headers: IncomingHttpHeaders,
  _query: Request["query"],
): Promise<void> {
  verifySignature(rawBody, headers);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    throw new ValidationError("Corpo do webhook não é JSON válido");
  }

  console.log(`[Webhook] Evento: ${body.event} | apiVersion: ${body.apiVersion}`);

  const parsed = parseCreditPayload(body);
  if (!parsed) return; // evento ignorado (ex: checkout.disputed)

  const { externalPaymentId, amountCents, userId } = parsed;

  // Idempotência: não processa o mesmo pagamento duas vezes
  const existing = await prisma.payment.findUnique({ where: { externalId: externalPaymentId } });
  if (existing) {
    console.log(`[Webhook] Pagamento já processado: ${externalPaymentId}`);
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ValidationError(`Usuário não encontrado: ${userId}`);

  const credits = calcCredits(amountCents);
  console.log(`[Webhook] +${credits} créditos → ${user.email} (R$ ${(amountCents / 100).toFixed(2)})`);

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
      data: { credit: { increment: credits } },
    }),
  ]);

  console.log(`[Webhook] ✅ Concluído: ${credits} créditos adicionados para ${user.email}`);
}