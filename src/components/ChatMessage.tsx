// src/components/ChatMessage.tsx
import { Message } from "@/types/azure-openai";
import { useState } from "react";
import { Copy, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatMessage = ({ message, isStreaming = false }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [copiedCodeBlock, setCopiedCodeBlock] = useState<number | null>(null);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Message copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const copyCodeBlock = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeBlock(index);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedCodeBlock(null), 2000);
  };
  
  // Check if the message contains any markdown elements
  const containsMarkdown = message.role === "assistant" && (
    message.content.includes("```") || // code blocks
    message.content.includes("#") ||   // headings
    message.content.includes("**") ||  // bold text
    message.content.includes("- ") ||  // list items
    message.content.includes("1. ")    // ordered list
  );
  
  // Custom components for ReactMarkdown
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      // Only add copy button for code blocks (not inline code)
      if (!inline) {
        // Find the index of this code block for tracking copy state
        const codeBlocks = message.content.split('```').filter((_, i) => i % 2 === 1);
        const index = codeBlocks.findIndex(block => block.includes(codeString));
        
        return (
          <div className="relative group/code">
            <pre className={className} {...props}>
              <code className={match ? `language-${match[1]}` : ''} {...props}>
                {children}
              </code>
            </pre>
            <button
              onClick={() => copyCodeBlock(codeString, index)}
              className="absolute top-2 right-2 p-1 rounded-md bg-gray-700/50 text-gray-200 opacity-0 group-hover/code:opacity-100 transition-opacity"
              aria-label="Copy code"
            >
              {copiedCodeBlock === index ? <CheckCheck size={16} /> : <Copy size={16} />}
            </button>
          </div>
        );
      }
      
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
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
          <div className={cn(
            "text-foreground",
            containsMarkdown && "prose dark:prose-invert prose-sm max-w-none"
          )}>
            {containsMarkdown ? (
              // Render with Markdown for assistant messages with markdown elements
              <>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[[rehypeHighlight, { detect: true }]]}
                  components={components}
                >
                  {message.content}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-azure-500 animate-pulse-slow" />
                )}
              </>
            ) : (
              // Regular text rendering for messages without markdown elements
              <div className="whitespace-pre-wrap">
                {message.content}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-azure-500 animate-pulse-slow" />
                )}
              </div>
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