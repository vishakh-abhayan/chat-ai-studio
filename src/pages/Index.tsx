import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AIServiceFactory } from "@/services/ai-service-factory";
import { AIServiceInterface } from "@/services/ai-service-interface";
import { storageService } from "@/services/storage-service";
import {
  AIProviderConfig,
  Conversation,
  BaseMessage,
} from "@/types/ai-providers";
import { Button } from "@/components/ui/button";
import { ConversationList } from "@/components/ConversationList";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { MultiProviderConfigPanel } from "@/components/MultiProviderConfigPanel";
import { ImportExportDialog } from "@/components/ImportExportDialog";
import { toast } from "sonner";
import { Trash2, Copy, Download, FilePlus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const DEFAULT_CONFIG: AIProviderConfig = {
  provider: "openai",
  apiKey: "",
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  maxTokens: 800,
  topP: 0.95,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

const DEFAULT_SYSTEM_MESSAGE: BaseMessage = {
  role: "system",
  content: "You are a helpful assistant.",
};

const Index = () => {
  // State
  const [config, setConfig] = useState<AIProviderConfig>(DEFAULT_CONFIG);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [isConfigPanelCollapsed, setIsConfigPanelCollapsed] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiServiceRef = useRef<AIServiceInterface | null>(null);

  // Get active conversation
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;

  // Initialize data from localStorage
  useEffect(() => {
    const savedConfig = storageService.getConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    }

    const savedConversations = storageService.getConversations();
    if (savedConversations.length > 0) {
      setConversations(savedConversations);

      const activeId = storageService.getActiveConversationId();
      if (activeId && savedConversations.some((c) => c.id === activeId)) {
        setActiveConversationId(activeId);
      } else {
        setActiveConversationId(savedConversations[0].id);
      }
    }
  }, []);

  // Update API service when config changes
  useEffect(() => {
    try {
      apiServiceRef.current = AIServiceFactory.createService(config);

      // Validate the configuration
      if (!apiServiceRef.current.validateConfig()) {
        console.warn("Invalid configuration for provider:", config.provider);
        apiServiceRef.current = null;
      }
    } catch (error) {
      console.error("Error initializing AI service:", error);
      toast.error("Failed to initialize AI service");
      apiServiceRef.current = null;
    }
  }, [config]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  // CRUD operations for conversations
  const createNewConversation = () => {
    const newId = uuidv4();
    const newConversation: Conversation = {
      id: newId,
      name: `Conversation ${conversations.length + 1}`,
      messages: [{ ...DEFAULT_SYSTEM_MESSAGE }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provider: config.provider,
    };

    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    setActiveConversationId(newId);
    storageService.saveConversation(newConversation);
    storageService.setActiveConversationId(newId);
  };

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    storageService.setActiveConversationId(id);
  };

  const renameConversation = (id: string, name: string) => {
    const updatedConversations = conversations.map((conversation) => {
      if (conversation.id === id) {
        const updated = {
          ...conversation,
          name,
          updatedAt: new Date().toISOString(),
        };
        storageService.saveConversation(updated);
        return updated;
      }
      return conversation;
    });

    setConversations(updatedConversations);
  };

  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter((c) => c.id !== id);
    setConversations(updatedConversations);
    storageService.deleteConversation(id);

    if (activeConversationId === id) {
      const newActiveId =
        updatedConversations.length > 0 ? updatedConversations[0].id : null;
      setActiveConversationId(newActiveId);
      if (newActiveId) {
        storageService.setActiveConversationId(newActiveId);
      }
    }
  };

  const clearConversation = () => {
    if (!activeConversationId) return;

    const updatedConversations = conversations.map((conversation) => {
      if (conversation.id === activeConversationId) {
        const updated = {
          ...conversation,
          messages: [{ ...DEFAULT_SYSTEM_MESSAGE }],
          updatedAt: new Date().toISOString(),
        };
        storageService.saveConversation(updated);
        return updated;
      }
      return conversation;
    });

    setConversations(updatedConversations);
    toast.success("Conversation cleared");
  };

  // Message handling
  const sendMessage = async (content: string) => {
    if (!content.trim() || !activeConversationId || !apiServiceRef.current)
      return;

    // Check if config is valid
    if (!apiServiceRef.current.validateConfig()) {
      toast.error(
        `Please configure ${apiServiceRef.current.getProviderName()} settings first`
      );
      setIsConfigPanelCollapsed(false);
      return;
    }

    // Find and update conversation
    const conversation = conversations.find(
      (c) => c.id === activeConversationId
    );
    if (!conversation) return;

    // Add user message
    const userMessage: BaseMessage = { role: "user", content };
    let updatedMessages = [...conversation.messages, userMessage];

    // Update conversation state with user message
    const updatedConversation: Conversation = {
      ...conversation,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
      provider: config.provider,
    };

    const updatedConversations = conversations.map((c) =>
      c.id === activeConversationId ? updatedConversation : c
    );

    setConversations(updatedConversations);
    storageService.saveConversation(updatedConversation);

    // Add placeholder for assistant response
    const assistantMessage: BaseMessage = { role: "assistant", content: "" };
    updatedMessages = [...updatedMessages, assistantMessage];

    setIsLoading(true);
    setIsStreaming(true);

    try {
      // Prepare messages for API
      const messagesToSend = updatedMessages.slice(0, -1); // Exclude empty assistant message

      // Streaming response handler
      let assistantResponse = "";
      await apiServiceRef.current.sendMessage(messagesToSend, (chunk) => {
        assistantResponse += chunk;

        // Update UI with streaming chunks
        const streamingConversation: Conversation = {
          ...updatedConversation,
          messages: [
            ...updatedMessages.slice(0, -1),
            { role: "assistant", content: assistantResponse },
          ],
        };

        const streamingConversations = conversations.map((c) =>
          c.id === activeConversationId ? streamingConversation : c
        );

        setConversations(streamingConversations);
      });

      setIsStreaming(false);

      // Ensure final content is saved when streaming completes
      const finalConversation: Conversation = {
        ...updatedConversation,
        messages: [
          ...updatedMessages.slice(0, -1),
          { role: "assistant", content: assistantResponse },
        ],
        updatedAt: new Date().toISOString(),
      };

      const finalConversations = conversations.map((c) =>
        c.id === activeConversationId ? finalConversation : c
      );

      setConversations(finalConversations);
      storageService.saveConversation(finalConversation);
    } catch (error) {
      toast.error(
        `Error calling ${apiServiceRef.current.getProviderName()} API`
      );
      console.error("API Error:", error);

      // Remove the placeholder assistant message on error
      const errorConversation: Conversation = {
        ...updatedConversation,
        updatedAt: new Date().toISOString(),
      };

      const errorConversations = conversations.map((c) =>
        c.id === activeConversationId ? errorConversation : c
      );

      setConversations(errorConversations);
      storageService.saveConversation(errorConversation);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // Configuration handlers
  const saveConfig = (newConfig: AIProviderConfig) => {
    setConfig(newConfig);
    storageService.saveConfig(newConfig);
  };

  // Import/Export handlers
  const handleExport = () => {
    return storageService.exportData();
  };

  const handleImport = (jsonData: string) => {
    const success = storageService.importData(jsonData);
    if (success) {
      // Reload data from storage
      const savedConfig = storageService.getConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      }

      const savedConversations = storageService.getConversations();
      setConversations(savedConversations);

      const activeId = storageService.getActiveConversationId();
      if (activeId && savedConversations.some((c) => c.id === activeId)) {
        setActiveConversationId(activeId);
      } else if (savedConversations.length > 0) {
        setActiveConversationId(savedConversations[0].id);
      } else {
        setActiveConversationId(null);
      }
    }

    return success;
  };

  // Copy entire conversation
  const copyConversation = () => {
    if (!activeConversation) return;

    const conversationText = activeConversation.messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    navigator.clipboard.writeText(conversationText);
    toast.success("Conversation copied to clipboard");
  };

  // UI Setup
  const emptyState = (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <FilePlus size={48} className="text-gray-300 mb-4" />
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
        No Conversation Selected
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Create a new conversation or select an existing one to get started.
      </p>
      <Button onClick={createNewConversation}>New Conversation</Button>
    </div>
  );

  const noConfigState = !config.apiKey && (
    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-4 rounded-md mb-4">
      <p className="text-sm">
        Please configure your AI provider settings in the panel on the right to
        start using the application.
      </p>
    </div>
  );

  const chatHeader = activeConversation && (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="font-medium truncate">{activeConversation.name}</h2>
        {activeConversation.provider && (
          <span className="text-xs bg-muted px-2 py-1 rounded">
            {activeConversation.provider}
          </span>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={copyConversation}>
          <Copy size={16} className="mr-1" />
          Copy
        </Button>
        <Button variant="outline" size="sm" onClick={clearConversation}>
          <Trash2 size={16} className="mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left sidebar */}
      <div className="w-64 border-r flex flex-col">
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
          onCreateConversation={createNewConversation}
          onDeleteConversation={deleteConversation}
          onRenameConversation={renameConversation}
        />

        <div className="mt-auto border-t p-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsImportExportOpen(true)}
          >
            <Download size={16} className="mr-2" />
            Import / Export
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeConversation ? (
          <>
            {chatHeader}
            {noConfigState}

            <div className="flex-1 overflow-y-auto">
              <div className="pb-4">
                {activeConversation.messages
                  .filter((message) => message.role !== "system")
                  .map((message, index) => (
                    <ChatMessage
                      key={index}
                      message={message}
                      isStreaming={
                        isStreaming &&
                        index === activeConversation.messages.length - 1 &&
                        message.role === "assistant"
                      }
                    />
                  ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t p-4">
              <ChatInput
                onSendMessage={sendMessage}
                isLoading={isLoading}
                placeholder={`Type a message... (Using ${config.provider})`}
              />
            </div>
          </>
        ) : (
          emptyState
        )}
      </div>

      {/* Configuration panel */}
      <MultiProviderConfigPanel
        config={config}
        onSaveConfig={saveConfig}
        isCollapsed={isConfigPanelCollapsed}
        onToggleCollapse={() =>
          setIsConfigPanelCollapsed(!isConfigPanelCollapsed)
        }
      />

      {/* Dialogs */}
      <ImportExportDialog
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onExport={handleExport}
        onImport={handleImport}
      />
    </div>
  );
};

export default Index;
