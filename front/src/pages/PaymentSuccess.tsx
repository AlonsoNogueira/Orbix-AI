import { Link, useNavigate } from "react-router-dom";
import { Bot, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center animate-fade-slide-up">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-semibold text-foreground">OrbixAI</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Pagamento recebido
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Seu saldo de créditos será atualizado em instantes.<br />
          Redirecionando para o chat em <span className="font-bold text-primary">{countdown}s</span>...
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        >
          Ir para o chat agora
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
