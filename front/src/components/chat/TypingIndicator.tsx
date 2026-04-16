import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 animate-fade-slide-up">
      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 bg-surface text-muted-foreground">
        <Bot size={14} />
      </div>
      <div className="bg-chat-ai px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default TypingIndicator;
