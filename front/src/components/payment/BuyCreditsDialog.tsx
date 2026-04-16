import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Phone, CreditCard, Zap } from "lucide-react";

const PACKS = [
  { label: "R$ 1,00", cents: 100, credits: 5 },
  { label: "R$ 5,00", cents: 500, credits: 25 },
  { label: "R$ 10,00", cents: 1000, credits: 50 },
  { label: "R$ 20,00", cents: 2000, credits: 100 },
] as const;

type Step = "pack" | "customer";

type BuyCreditsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const inputClass =
  "w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all";

export function BuyCreditsDialog({ open, onOpenChange }: BuyCreditsDialogProps) {
  const [step, setStep]           = useState<Step>("pack");
  const [selectedCents, setSelectedCents] = useState<number | null>(null);
  const [cellphone, setCellphone] = useState("");
  const [taxId, setTaxId]         = useState("");
  const [loading, setLoading]     = useState(false);

  function handleReset() {
    setStep("pack");
    setSelectedCents(null);
    setCellphone("");
    setTaxId("");
    setLoading(false);
  }

  function handleOpenChange(v: boolean) {
    if (!v) handleReset();
    onOpenChange(v);
  }

  function handleSelectPack(cents: number) {
    setSelectedCents(cents);
    setStep("customer");
  }

  // Mascara enquanto digita: (85) 99999-8888
  function handleCellphoneChange(raw: string) {
    const d = raw.replace(/\D/g, "").slice(0, 11);
    let f = d;
    if (d.length > 2)  f = `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length > 7)  f = `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    setCellphone(f);
  }

  // Mascara CPF: 000.000.000-00
  function handleTaxIdChange(raw: string) {
    const d = raw.replace(/\D/g, "").slice(0, 11);
    let f = d;
    if (d.length > 3)  f = `${d.slice(0,3)}.${d.slice(3)}`;
    if (d.length > 6)  f = `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
    if (d.length > 9)  f = `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
    setTaxId(f);
  }

  async function handleCheckout() {
    if (!selectedCents) return;

    const rawCellphone = cellphone.replace(/\D/g, "");
    const rawTaxId     = taxId.replace(/\D/g, "");

    if (rawCellphone.length < 10) {
      toast.error("Informe um telefone válido com DDD");
      return;
    }
    if (rawTaxId.length !== 11) {
      toast.error("Informe um CPF válido (11 dígitos)");
      return;
    }

    setLoading(true);
    try {
      const r = await apiFetch("/payment/checkout", {
        method: "POST",
        body: JSON.stringify({
          amountCents: selectedCents,
          cellphone: rawCellphone,
          taxId: rawTaxId,
        }),
      });
      const url = r.data?.url as string;
      window.location.href = url;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao iniciar pagamento");
      setLoading(false);
    }
  }

  const selectedPack = PACKS.find((p) => p.cents === selectedCents);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">

        {/* ── STEP 1: Escolher pacote ── */}
        {step === "pack" && (
          <>
            <DialogHeader>
              <DialogTitle>Comprar créditos</DialogTitle>
              <DialogDescription>
                Pagamento via PIX. Créditos liberados automaticamente após confirmação.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              {PACKS.map((p) => (
                <Button
                  key={p.cents}
                  type="button"
                  variant="outline"
                  className="h-auto w-full justify-between gap-3 py-3"
                  onClick={() => handleSelectPack(p.cents)}
                >
                  <span className="font-medium">{p.label}</span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Zap className="h-3.5 w-3.5 text-primary/70" />
                    <span className="font-medium text-foreground">{p.credits}</span>
                    créditos
                  </span>
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">5 créditos por R$ 1,00 pago.</p>
          </>
        )}

        {/* ── STEP 2: Dados do pagador ── */}
        {step === "customer" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("pack")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <DialogTitle>Dados para pagamento</DialogTitle>
              </div>
              <DialogDescription>
                Necessário para emissão do PIX.{" "}
                {selectedPack && (
                  <span className="font-medium text-foreground">
                    {selectedPack.label} · {selectedPack.credits} créditos
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-2">
              {/* Telefone */}
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="(DDD) 99999-9999"
                  value={cellphone}
                  onChange={(e) => handleCellphoneChange(e.target.value)}
                  maxLength={15}
                  className={inputClass}
                />
              </div>

              {/* CPF */}
              <div className="relative">
                <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={taxId}
                  onChange={(e) => handleTaxIdChange(e.target.value)}
                  maxLength={14}
                  className={inputClass}
                />
              </div>
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={loading}
              onClick={handleCheckout}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Ir para o pagamento"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Seus dados são salvos para facilitar compras futuras.
            </p>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}