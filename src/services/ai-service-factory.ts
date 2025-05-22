import { AIProviderConfig } from "@/types/ai-providers";
import { AIServiceInterface } from "./ai-service-interface";
import { AzureOpenAIService } from "./azure-openai-service";
import { OpenAIService } from "./providers/openai-service";
import { ClaudeService } from "./providers/claude-service";
import { GeminiService } from "./providers/gemini-service";
import { GroqService } from "./providers/groq-service";

export class AIServiceFactory {
  static createService(config: AIProviderConfig): AIServiceInterface {
    switch (config.provider) {
      case "azure":
        return new AzureOpenAIService(config);
      case "openai":
        return new OpenAIService(config);
      case "claude":
        return new ClaudeService(config);
      case "gemini":
        return new GeminiService(config);
      case "groq":
        return new GroqService(config);
      default:
        throw new Error(`Unsupported provider: ${(config as any).provider}`);
    }
  }
}
