import Groq from "groq-sdk";
import { GroqConfig, BaseMessage } from "@/types/ai-providers";
import { AIServiceInterface } from "../ai-service-interface";

export class GroqService implements AIServiceInterface {
  private client: Groq | null = null;
  private config: GroqConfig;

  constructor(config: GroqConfig) {
    this.config = config;
    this.initClient();
  }

  private initClient(): void {
    if (this.config.apiKey) {
      try {
        this.client = new Groq({
          apiKey: this.config.apiKey,
          dangerouslyAllowBrowser: true,
        });
      } catch (error) {
        console.error("Error initializing Groq client:", error);
        this.client = null;
      }
    }
  }

  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.model);
  }

  getProviderName(): string {
    return "Groq";
  }

  async sendMessage(
    messages: BaseMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    if (!this.client) {
      throw new Error("Groq client not initialized");
    }

    const params = {
      model: this.config.model,
      messages,
      temperature: this.config.temperature ?? 0.7,
      max_tokens: this.config.maxTokens ?? 800,
      top_p: this.config.topP ?? 0.95,
      stop: this.config.stop,
      stream: !!onChunk,
    };

    if (onChunk) {
      const stream = await this.client.chat.completions.create({
        ...params,
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
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
