const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

export type MeResponse = {
  id: string;
  email: string;
  name: string | null;
  credit: number;
};

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(error.message || "Requisição falhou");
  }

  return response.json();
}

export async function getMe(): Promise<MeResponse> {
  const r = await apiFetch("/user/me");
  return r.data as MeResponse;
}

export async function createCheckout(
  amountCents: number,
  customerData?: { cellphone: string; taxId: string },
): Promise<{ url: string; credits: number }> {
  const r = await apiFetch("/payment/checkout", {
    method: "POST",
    body: JSON.stringify({ amountCents, ...customerData }),
  });
  return r.data as { url: string; credits: number };
}