import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiConfig, BaseMessage } from "@/types/ai-providers";
import { AIServiceInterface } from "../ai-service-interface";

export class GeminiService implements AIServiceInterface {
  private client: GoogleGenerativeAI | null = null;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = config;
    this.initClient();
  }

  private initClient(): void {
    if (this.config.apiKey) {
      try {
        this.client = new GoogleGenerativeAI(this.config.apiKey);
      } catch (error) {
        console.error("Error initializing Gemini client:", error);
        this.client = null;
      }
    }
  }

  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.model);
  }

  getProviderName(): string {
    return "Gemini";
  }

  async sendMessage(
    messages: BaseMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    if (!this.client) {
      throw new Error("Gemini client not initialized");
    }

    const model = this.client.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        temperature: this.config.temperature ?? 0.7,
        topK: this.config.topK ?? 40,
        topP: this.config.topP ?? 0.95,
        maxOutputTokens: this.config.maxTokens ?? 800,
      },
    });

    // Convert messages to Gemini format
    const history = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const chat = model.startChat({ history });

    const lastMessage = messages[messages.length - 1];

    if (onChunk) {
      const result = await chat.sendMessageStream(lastMessage.content);
      let fullContent = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullContent += chunkText;
        onChunk(chunkText);
      }

      return fullContent;
    } else {
      const result = await chat.sendMessage(lastMessage.content);
      return result.response.text();
    }
  }
}
