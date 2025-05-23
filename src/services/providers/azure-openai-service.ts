import { AzureOpenAI } from "openai";
import { AzureOpenAIConfig, BaseMessage } from "../../types/ai-providers";
import { AIServiceInterface } from "../ai-service-interface";

export class AzureOpenAIService implements AIServiceInterface {
  private client: AzureOpenAI | null = null;
  private config: AzureOpenAIConfig;

  constructor(config: AzureOpenAIConfig) {
    this.config = config;
    this.initClient();
  }

  private initClient(): void {
    if (
      this.config.apiKey &&
      this.config.endpoint &&
      this.config.deploymentName
    ) {
      try {
        this.client = new AzureOpenAI({
          apiKey: this.config.apiKey,
          endpoint: this.config.endpoint,
          apiVersion: this.config.apiVersion,
          deployment: this.config.deploymentName,
          dangerouslyAllowBrowser: true,
        });
      } catch (error) {
        console.error("Error initializing Azure OpenAI client:", error);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  validateConfig(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.endpoint &&
      this.config.deploymentName
    );
  }

  getProviderName(): string {
    return "Azure OpenAI";
  }

  public async sendMessage(
    messages: BaseMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      if (!this.client) {
        throw new Error(
          "Azure OpenAI client not initialized. Please check your configuration."
        );
      }

      const params = {
        messages,
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens ?? 800,
        top_p: this.config.topP ?? 0.95,
        frequency_penalty: this.config.frequencyPenalty ?? 0,
        presence_penalty: this.config.presencePenalty ?? 0,
        stream: !!onChunk,
        model: this.config.deploymentName,
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
    } catch (error) {
      console.error("Error calling Azure OpenAI API:", error);
      throw error;
    }
  }
}
