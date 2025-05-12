
import { AzureOpenAI } from "openai";
import { AzureOpenAIConfig, Message } from "../types/azure-openai";

export class AzureOpenAIService {
  private client: AzureOpenAI;
  private config: AzureOpenAIConfig;

  constructor(config: AzureOpenAIConfig) {
    this.config = config;
    this.client = new AzureOpenAI({
      apiKey: this.config.apiKey,
      endpoint: this.config.endpoint,
      apiVersion: this.config.apiVersion,
      deployment: this.config.deploymentName,
    });
  }

  public async sendMessage(messages: Message[], onChunk?: (chunk: string) => void): Promise<string> {
    try {
      const params = {
        messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP,
        frequency_penalty: this.config.frequencyPenalty,
        presence_penalty: this.config.presencePenalty,
        stream: !!onChunk,
        model: this.config.deploymentName, // Model name is required for the OpenAI SDK
      };

      if (onChunk) {
        // Handle streaming response
        const stream = await this.client.chat.completions.create(params);
        let fullContent = '';

        for await (const part of stream) {
          const content = part.choices[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk(content);
          }
        }

        return fullContent;
      } else {
        // Handle regular response
        const response = await this.client.chat.completions.create(params);
        return response.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('Error calling Azure OpenAI API:', error);
      throw error;
    }
  }
}
