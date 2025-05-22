// Base types that all providers share
export interface BaseMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface BaseConfig {
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

// Provider-specific configurations
export interface AzureOpenAIConfig extends BaseConfig {
  provider: "azure";
  endpoint: string;
  deploymentName: string;
  apiVersion: string;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface OpenAIConfig extends BaseConfig {
  provider: "openai";
  model: string;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ClaudeConfig extends BaseConfig {
  provider: "claude";
  model: string;
  maxTokens: number; // Required for Claude
}

export interface GeminiConfig extends BaseConfig {
  provider: "gemini";
  model: string;
  topP?: number;
  topK?: number;
}

export interface GroqConfig extends BaseConfig {
  provider: "groq";
  model: string;
  topP?: number;
  stop?: string[];
}

export type AIProviderConfig =
  | AzureOpenAIConfig
  | OpenAIConfig
  | ClaudeConfig
  | GeminiConfig
  | GroqConfig;

export interface Conversation {
  id: string;
  name: string;
  messages: BaseMessage[];
  createdAt: string;
  updatedAt: string;
  provider?: string; // Track which provider was used
}
