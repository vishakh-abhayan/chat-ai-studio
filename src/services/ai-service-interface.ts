import { BaseMessage } from "@/types/ai-providers";

export interface AIServiceInterface {
  sendMessage(
    messages: BaseMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<string>;

  validateConfig(): boolean;
  getProviderName(): string;
}
