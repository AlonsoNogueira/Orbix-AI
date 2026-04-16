import { Bot, User } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 animate-fade-slide-up ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-surface text-muted-foreground"
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-chat-user text-primary-foreground rounded-br-md"
            : "bg-chat-ai text-foreground rounded-bl-md"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

export default MessageBubble;
