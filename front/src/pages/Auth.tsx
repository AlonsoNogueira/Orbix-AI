import { useState } from "react";
import { Bot, Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

type AuthMode = "login" | "register";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", cellphone: "" });
  const navigate = useNavigate();

  const isLogin = mode === "login";

  // Formata enquanto digita: (85) 99999-8888
  const handleCellphoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    if (digits.length > 2) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length > 7) formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    setForm((f) => ({ ...f, cellphone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const body = isLogin
        ? { email: form.email, password: form.password }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
            // Envia só os dígitos para o backend
            cellphone: form.cellphone.replace(/\D/g, ""),
          };

      const response = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const token = response.data?.token || response.token;

      if (token) {
        localStorage.setItem("token", token);
        toast.success(isLogin ? "Bem-vindo de volta!" : "Conta criada com sucesso!");
        navigate("/");
      } else if (!isLogin) {
        toast.success("Conta criada! Por favor, faça login.");
        setMode("login");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-fade-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 mb-4">
            <Bot className="text-primary" size={24} />
          </div>
          <h1 className="text-xl font-semibold text-foreground">OrbixAI</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Entre na sua conta" : "Crie sua conta"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface rounded-xl p-1 mb-6">
          {(["login", "register"] as AuthMode[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === tab
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "login" ? "Entrar" : "Registrar"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative animate-fade-slide-up">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className={inputClass}
                />
              </div>

              <div className="relative animate-fade-slide-up">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="(DDD) 99999-9999"
                  value={form.cellphone}
                  onChange={(e) => handleCellphoneChange(e.target.value)}
                  required
                  maxLength={15}
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Seu e-mail"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className={inputClass}
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {isLogin && (
            <div className="text-right">
              <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors">
                Esqueceu a senha?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-md shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? "Entrar" : "Criar conta"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">ou continue com</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 bg-surface border border-border rounded-xl py-2.5 text-sm text-foreground hover:bg-surface-hover transition-all duration-200">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 bg-surface border border-border rounded-xl py-2.5 text-sm text-foreground hover:bg-surface-hover transition-all duration-200">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
          <button
            onClick={() => setMode(isLogin ? "register" : "login")}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {isLogin ? "Registre-se" : "Faça login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;