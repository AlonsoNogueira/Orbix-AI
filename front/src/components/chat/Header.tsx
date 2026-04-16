import { useState } from "react";
import { Bot, Trash2, LogOut, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BuyCreditsDialog } from "@/components/payment/BuyCreditsDialog";

interface HeaderProps {
  onClear: () => void;
  hasMessages: boolean;
  credits: number | null;
}

const Header = ({ onClear, hasMessages, credits }: HeaderProps) => {
  const navigate = useNavigate();
  const [buyOpen, setBuyOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Saiu com sucesso!");
    navigate("/auth");
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 shrink-0">
            <Bot className="w-4.5 h-4.5 text-primary" size={18} />
          </div>
          <h1 className="text-base font-semibold text-foreground tracking-tight truncate">
            OrbixAI
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground"
            title="Créditos disponíveis"
          >
            <Coins size={14} className="text-primary/80" />
            <span className="font-medium tabular-nums text-foreground">
              {credits === null ? "—" : credits}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBuyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary
                       hover:bg-primary/15 transition-all duration-200"
          >
            <Coins size={14} />
            <span className="hidden sm:inline">Créditos</span>
          </button>
          {hasMessages && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground rounded-lg 
                         hover:text-foreground hover:bg-surface-hover transition-all duration-200"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground rounded-lg 
                       hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>
      <BuyCreditsDialog open={buyOpen} onOpenChange={setBuyOpen} />
    </>
  );
};

export default Header;
