import { BadRequestError } from "../../utils/errors";

const ABACATE_API = "https://api.abacatepay.com/v1";

export async function createBillingCheckout(userId: string, amountCents: number) {
  const apiKey = process.env.ABACATEPAY_API_KEY;
  if (!apiKey) {
    throw new BadRequestError("Pagamentos não configurados no servidor (ABACATEPAY_API_KEY)");
  }

  const frontendBase = (process.env.FRONTEND_URL || "http://localhost:8080").replace(
    /\/$/,
    "",
  );

  if (amountCents < 100) {
    throw new BadRequestError("Valor mínimo é R$ 1,00 (100 centavos)");
  }

  const payload = {
    frequency: "ONE_TIME" as const,
    methods: ["PIX", "CARD"] as const,
    products: [
      {
        externalId: `orbixai-credits-${userId}`,
        name: "Créditos OrbixAI",
        description: "Pacote de créditos para uso no chat",
        quantity: 1,
        price: amountCents,
      },
    ],
    returnUrl: frontendBase,
    completionUrl: `${frontendBase}/payment/success`,
    externalId: userId,
    metadata: { userId },
  };

  const res = await fetch(`${ABACATE_API}/billing/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as {
    data?: { url: string };
    error?: string | null;
    message?: string;
  };

  if (!res.ok || json.error) {
    const msg =
      (typeof json.error === "string" && json.error) ||
      json.message ||
      "Falha ao criar cobrança na AbacatePay";
    throw new BadRequestError(msg);
  }

  const url = json.data?.url;
  if (!url) {
    throw new BadRequestError("Resposta da AbacatePay sem URL de pagamento");
  }

  return { url };
}
