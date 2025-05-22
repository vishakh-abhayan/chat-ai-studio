import OpenAI from "openai";
import { OpenAIConfig, BaseMessage } from "@/types/ai-providers";
import { AIServiceInterface } from "../ai-service-interface";

export class OpenAIService implements AIServiceInterface {
  private client: OpenAI | null = null;
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
    this.initClient();
  }

  private initClient(): void {
    if (this.config.apiKey) {
      try {
        this.client = new OpenAI({
          apiKey: this.config.apiKey,
          dangerouslyAllowBrowser: true,
        });
      } catch (error) {
        console.error("Error initializing OpenAI client:", error);
        this.client = null;
      }
    }
  }

  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.model);
  }

  getProviderName(): string {
    return "OpenAI";
  }

  async sendMessage(
    messages: BaseMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized");
    }

    const params = {
      model: this.config.model,
      messages,
      temperature: this.config.temperature ?? 0.7,
      max_tokens: this.config.maxTokens ?? 800,
      top_p: this.config.topP ?? 0.95,
      frequency_penalty: this.config.frequencyPenalty ?? 0,
      presence_penalty: this.config.presencePenalty ?? 0,
      stream: !!onChunk,
    };

    if (onChunk) {
      const stream = await this.client.chat.completions.create({
        ...params,
        stream: true,
      });

      let fullContent = "";
      for await (const part of stream) {
        const content = part.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          onChunk(content);
        }
      }
      return fullContent;
    } else {
      const response = await this.client.chat.completions.create({
        ...params,
        stream: false,
      });
      return response.choices[0]?.message?.content || "";
    }
  }
}
