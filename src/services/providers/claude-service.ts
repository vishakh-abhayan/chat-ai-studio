import Anthropic from "@anthropic-ai/sdk";
import { ClaudeConfig, BaseMessage } from "@/types/ai-providers";
import { AIServiceInterface } from "../ai-service-interface";

export class ClaudeService implements AIServiceInterface {
  private client: Anthropic | null = null;
  private config: ClaudeConfig;

  constructor(config: ClaudeConfig) {
    this.config = config;
    this.initClient();
  }

  private initClient(): void {
    if (this.config.apiKey) {
      try {
        this.client = new Anthropic({
          apiKey: this.config.apiKey,
          dangerouslyAllowBrowser: true,
        });
      } catch (error) {
        console.error("Error initializing Claude client:", error);
        this.client = null;
      }
    }
  }

  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.model && this.config.maxTokens);
  }

  getProviderName(): string {
    return "Claude";
  }

  async sendMessage(
    messages: BaseMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    if (!this.client) {
      throw new Error("Claude client not initialized");
    }

    // Convert messages format for Claude
    const systemMessage =
      messages.find((m) => m.role === "system")?.content || "";
    const conversationMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const params = {
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature ?? 0.7,
      messages: conversationMessages,
      system: systemMessage,
      stream: !!onChunk,
    };

    if (onChunk) {
      const stream = await this.client.messages.create({
        ...params,
        stream: true,
      });

      let fullContent = "";
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          const content = event.delta.text;
          fullContent += content;
          onChunk(content);
        }
      }
      return fullContent;
    } else {
      const response = await this.client.messages.create({
        ...params,
        stream: false,
      });
      return response.content[0].type === "text"
        ? response.content[0].text
        : "";
    }
  }
}
