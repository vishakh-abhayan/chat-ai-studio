// src/components/ChatMessage.tsx
import { Message } from "@/types/azure-openai";
import { useState } from "react";
import { Copy, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage = ({ message, isStreaming = false }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Message copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className={cn(
      "py-4 px-6 group",
      message.role === "assistant" 
        ? "bg-muted/50 dark:bg-muted/20" 
        : "bg-background dark:bg-background/40"
    )}>
      <div className="max-w-4xl mx-auto flex gap-4">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          message.role === "user" 
            ? "bg-azure-500 text-white" 
            : "bg-muted text-foreground dark:bg-muted/30"
        )}>
          {message.role === "user" ? "U" : "A"}
        </div>
        
        <div className="flex-1">
          <div className="font-medium mb-1">
            {message.role === "user" ? "You" : "Assistant"}
          </div>
          <div className="text-foreground whitespace-pre-wrap">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-azure-500 animate-pulse-slow" />
            )}
          </div>
        </div>
        
        <button 
          onClick={copyToClipboard}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
          aria-label="Copy message"
        >
          {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
};