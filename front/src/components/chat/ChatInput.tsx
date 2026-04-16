import { SendHorizontal } from "lucide-react";
import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <div className="flex-1 bg-surface rounded-xl border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none scrollbar-thin"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
            ${canSend
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25 active:scale-95"
              : "bg-surface text-muted-foreground cursor-not-allowed"
            }`}
        >
          <SendHorizontal size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
