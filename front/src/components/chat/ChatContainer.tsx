import { useState, useRef, useEffect, useCallback } from "react";
import Header from "./Header";
import MessageBubble, { type Message } from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import { Bot, Sparkles, Code, Lightbulb } from "lucide-react";
import { apiFetch, getMe } from "@/lib/api";
import { toast } from "sonner";

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadCredits = useCallback(async () => {
    try {
      const me = await getMe();
      setCredits(me.credit);
    } catch {
      setCredits(null);
    }
  }, []);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  useEffect(() => {
    const onFocus = () => loadCredits();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadCredits]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const getAIResponse = useCallback(async (userContent: string) => {
    setIsLoading(true);
    try {
      const data = await apiFetch("/groq/chat", {
        method: "POST",
        body: JSON.stringify({ message: userContent }),
      });

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.data || data.response || data.message || "Sem resposta do servidor",
      };

      setMessages((prev) => [...prev, aiMessage]);
      void loadCredits();
    } catch (error: any) {
      toast.error(error.message || "Erro ao obter resposta da IA");
    } finally {
      setIsLoading(false);
    }
  }, [loadCredits]);

  const handleSend = useCallback(
    (content: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };
      setMessages((prev) => [...prev, userMessage]);
      getAIResponse(content);
    },
    [getAIResponse]
  );

  const handleClear = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <div className="flex flex-col h-dvh bg-background">
      <Header
        onClear={handleClear}
        hasMessages={messages.length > 0}
        credits={credits}
      />

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full px-4 animate-fade-slide-up">
    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
      <Bot className="text-primary" size={28} />
    </div>
    <h2 className="text-xl font-semibold text-foreground mb-2">
      Como posso ajudar?
    </h2>
    <p className="text-sm text-muted-foreground text-center max-w-sm mb-8">
      Pergunte sobre programação, tecnologia ou qualquer assunto.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
      {[
        { icon: Code, label: "Explique async/await em JavaScript" },
        { icon: Sparkles, label: "Dicas para melhorar meu código" },
        { icon: Lightbulb, label: "O que é machine learning?" },
      ].map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 px-4 py-3 bg-surface rounded-xl border border-border 
                     text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 
                     cursor-default transition-all duration-200"
        >
          <Icon size={14} className="flex-shrink-0 text-primary/70" />
          <span className="line-clamp-2">{label}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ChatContainer;
