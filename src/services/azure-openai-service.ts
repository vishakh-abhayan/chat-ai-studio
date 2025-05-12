
import { AzureOpenAIConfig, Message, APIResponse } from "../types/azure-openai";

export class AzureOpenAIService {
  private config: AzureOpenAIConfig;

  constructor(config: AzureOpenAIConfig) {
    this.config = config;
  }

  public async sendMessage(messages: Message[], onChunk?: (chunk: string) => void): Promise<string> {
    try {
      const url = `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}/chat/completions?api-version=${this.config.apiVersion}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          top_p: this.config.topP,
          frequency_penalty: this.config.frequencyPenalty,
          presence_penalty: this.config.presencePenalty,
          stream: !!onChunk,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
      }

      if (onChunk) {
        return this.handleStreamingResponse(response, onChunk);
      } else {
        const data: APIResponse = await response.json();
        return data.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('Error calling Azure OpenAI API:', error);
      throw error;
    }
  }

  private async handleStreamingResponse(response: Response, onChunk: (chunk: string) => void): Promise<string> {
    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split('\n')
          .filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.substring(6)) as APIResponse;
              const content = jsonData.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch (e) {
              console.error('Error parsing streaming response:', e);
            }
          }
        }
      }
      
      return fullContent;
    } catch (error) {
      console.error('Error reading stream:', error);
      throw error;
    }
  }
}
