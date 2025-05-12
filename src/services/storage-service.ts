
import { AzureOpenAIConfig, Conversation } from "../types/azure-openai";

const STORAGE_KEYS = {
  CONFIG: 'azure-openai-config',
  CONVERSATIONS: 'azure-openai-conversations',
  ACTIVE_CONVERSATION: 'azure-openai-active-conversation'
};

export class StorageService {
  public saveConfig(config: AzureOpenAIConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  public getConfig(): AzureOpenAIConfig | null {
    const config = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return config ? JSON.parse(config) : null;
  }

  public saveConversation(conversation: Conversation): void {
    const conversations = this.getConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    
    if (existingIndex !== -1) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }
    
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  }

  public getConversations(): Conversation[] {
    const conversations = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return conversations ? JSON.parse(conversations) : [];
  }

  public deleteConversation(id: string): void {
    const conversations = this.getConversations().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    
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
      conversations: this.getConversations()
    };
    return JSON.stringify(data, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.config) {
        this.saveConfig(data.config);
      }
      
      if (Array.isArray(data.conversations)) {
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(data.conversations));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
