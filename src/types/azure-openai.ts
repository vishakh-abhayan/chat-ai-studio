
export interface AzureOpenAIConfig {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface APIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta?: {
      role?: string;
      content?: string;
    };
    message?: Message;
    finish_reason: string | null;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
