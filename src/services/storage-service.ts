import { AIProviderConfig, Conversation } from "../types/ai-providers";

const STORAGE_KEYS = {
  CONFIG: "ai-chat-config",
  CONVERSATIONS: "ai-chat-conversations",
  ACTIVE_CONVERSATION: "ai-chat-active-conversation",
};

export class StorageService {
  public saveConfig(config: AIProviderConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  public getConfig(): AIProviderConfig | null {
    const config = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!config) return null;

    try {
      const parsed = JSON.parse(config);
      // Handle legacy Azure configs without provider field
      if (!parsed.provider && parsed.endpoint && parsed.deploymentName) {
        parsed.provider = "azure";
      }
      return parsed;
    } catch (error) {
      console.error("Error parsing config:", error);
      return null;
    }
  }

  public saveConversation(conversation: Conversation): void {
    const conversations = this.getConversations();
    const existingIndex = conversations.findIndex(
      (c) => c.id === conversation.id
    );

    if (existingIndex !== -1) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }

    localStorage.setItem(
      STORAGE_KEYS.CONVERSATIONS,
      JSON.stringify(conversations)
    );
  }

  public getConversations(): Conversation[] {
    const conversations = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return conversations ? JSON.parse(conversations) : [];
  }

  public deleteConversation(id: string): void {
    const conversations = this.getConversations().filter((c) => c.id !== id);
    localStorage.setItem(
      STORAGE_KEYS.CONVERSATIONS,
      JSON.stringify(conversations)
    );

    if (this.getActiveConversationId() === id) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
    }
  }

  public setActiveConversationId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
  }

  public getActiveConversationId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  }

  public exportData(): string {
    const data = {
      config: this.getConfig(),
      conversations: this.getConversations(),
      version: "2.0", // Add version for future compatibility
    };
    return JSON.stringify(data, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      if (data.config) {
        // Handle legacy configs
        if (!data.config.provider && data.config.endpoint) {
          data.config.provider = "azure";
        }
        this.saveConfig(data.config);
      }

      if (Array.isArray(data.conversations)) {
        localStorage.setItem(
          STORAGE_KEYS.CONVERSATIONS,
          JSON.stringify(data.conversations)
        );
      }

      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }
}

export const storageService = new StorageService();
