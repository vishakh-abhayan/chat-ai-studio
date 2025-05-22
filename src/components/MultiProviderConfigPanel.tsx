import { AIProviderConfig } from "@/types/ai-providers";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ChevronRight, Save } from "lucide-react";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MultiProviderConfigPanelProps {
  config: AIProviderConfig;
  onSaveConfig: (config: AIProviderConfig) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Model options for each provider
const MODEL_OPTIONS = {
  openai: [
    "gpt-4-turbo-preview",
    "gpt-4",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-16k",
  ],
  claude: [
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
    "claude-2.1",
    "claude-2.0",
  ],
  gemini: ["gemini-pro", "gemini-pro-vision"],
  groq: ["mixtral-8x7b-32768", "llama2-70b-4096", "gemma-7b-it"],
};

export const MultiProviderConfigPanel = ({
  config,
  onSaveConfig,
  isCollapsed,
  onToggleCollapse,
}: MultiProviderConfigPanelProps) => {
  const [formState, setFormState] = useState<AIProviderConfig>(config);
  const [provider, setProvider] = useState(config.provider || "azure");

  const handleProviderChange = (
    newProvider: "azure" | "openai" | "claude" | "gemini" | "groq"
  ) => {
    setProvider(newProvider);

    // Create default config for new provider
    const baseConfig = {
      apiKey: formState.apiKey || "",
      temperature: formState.temperature ?? 0.7,
      maxTokens: formState.maxTokens ?? 800,
    };

    let newConfig: AIProviderConfig;

    switch (newProvider) {
      case "azure":
        newConfig = {
          ...baseConfig,
          provider: "azure",
          endpoint: "",
          deploymentName: "",
          apiVersion: "2023-05-15",
          topP: 0.95,
          frequencyPenalty: 0,
          presencePenalty: 0,
        };
        break;
      case "openai":
        newConfig = {
          ...baseConfig,
          provider: "openai",
          model: MODEL_OPTIONS.openai[0],
          topP: 0.95,
          frequencyPenalty: 0,
          presencePenalty: 0,
        };
        break;
      case "claude":
        newConfig = {
          ...baseConfig,
          provider: "claude",
          model: MODEL_OPTIONS.claude[0],
          maxTokens: 4096,
        };
        break;
      case "gemini":
        newConfig = {
          ...baseConfig,
          provider: "gemini",
          model: MODEL_OPTIONS.gemini[0],
          topP: 0.95,
          topK: 40,
        };
        break;
      case "groq":
        newConfig = {
          ...baseConfig,
          provider: "groq",
          model: MODEL_OPTIONS.groq[0],
          topP: 0.95,
        };
        break;
      default:
        newConfig = formState;
    }

    setFormState(newConfig);
  };

  const handleSave = () => {
    onSaveConfig(formState);
    toast.success("Configuration saved");
  };

  const handleChange = (field: string, value: string | number) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  if (isCollapsed) {
    return (
      <div className="border-l bg-muted/30 dark:bg-muted/10 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-full hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors"
        >
          <ChevronRight className="rotate-180" size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-l bg-muted/30 dark:bg-muted/10 w-96 flex flex-col transition-all duration-300 ease-in-out p-4"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">AI Provider Configuration</h2>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="space-y-6 overflow-y-auto flex-1">
        {/* Provider Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Provider
          </h3>

          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="azure">Azure OpenAI</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                <SelectItem value="gemini">Gemini (Google)</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Provider-specific settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            API Settings
          </h3>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={formState.apiKey}
              onChange={(e) => handleChange("apiKey", e.target.value)}
              placeholder={`Enter your ${provider} API Key`}
            />
          </div>

          {/* Azure-specific fields */}
          {provider === "azure" && "endpoint" in formState && (
            <>
              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint URL</Label>
                <Input
                  id="endpoint"
                  value={formState.endpoint}
                  onChange={(e) => handleChange("endpoint", e.target.value)}
                  placeholder="https://your-resource-name.openai.azure.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deploymentName">Deployment Name</Label>
                <Input
                  id="deploymentName"
                  value={formState.deploymentName}
                  onChange={(e) =>
                    handleChange("deploymentName", e.target.value)
                  }
                  placeholder="your-deployment-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiVersion">API Version</Label>
                <Input
                  id="apiVersion"
                  value={formState.apiVersion}
                  onChange={(e) => handleChange("apiVersion", e.target.value)}
                  placeholder="2023-05-15"
                />
              </div>
            </>
          )}

          {/* Model selection for non-Azure providers */}
          {provider !== "azure" && "model" in formState && (
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={formState.model}
                onValueChange={(value) => handleChange("model", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS[provider as keyof typeof MODEL_OPTIONS]?.map(
                    (model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Separator />

        {/* Common model parameters */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Model Parameters
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">
                Temperature: {formState.temperature?.toFixed(2) ?? "0.70"}
              </Label>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.01}
              value={[formState.temperature ?? 0.7]}
              onValueChange={(value) => handleChange("temperature", value[0])}
            />
            <p className="text-xs text-gray-500">
              Controls randomness: lower is more deterministic
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxTokens">
                Max Tokens: {formState.maxTokens ?? 800}
              </Label>
            </div>
            <Slider
              id="maxTokens"
              min={50}
              max={provider === "claude" ? 4096 : 8000}
              step={10}
              value={[formState.maxTokens ?? 800]}
              onValueChange={(value) => handleChange("maxTokens", value[0])}
            />
          </div>

          {/* Provider-specific parameters */}
          {(provider === "azure" ||
            provider === "openai" ||
            provider === "gemini" ||
            provider === "groq") &&
            "topP" in formState && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="topP">
                    Top P: {formState.topP?.toFixed(2) ?? "0.95"}
                  </Label>
                </div>
                <Slider
                  id="topP"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[formState.topP ?? 0.95]}
                  onValueChange={(value) => handleChange("topP", value[0])}
                />
              </div>
            )}

          {provider === "gemini" && "topK" in formState && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="topK">Top K: {formState.topK ?? 40}</Label>
              </div>
              <Slider
                id="topK"
                min={1}
                max={100}
                step={1}
                value={[formState.topK ?? 40]}
                onValueChange={(value) => handleChange("topK", value[0])}
              />
            </div>
          )}

          {(provider === "azure" || provider === "openai") &&
            "frequencyPenalty" in formState && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="frequencyPenalty">
                      Frequency Penalty:{" "}
                      {formState.frequencyPenalty?.toFixed(2) ?? "0.00"}
                    </Label>
                  </div>
                  <Slider
                    id="frequencyPenalty"
                    min={-2}
                    max={2}
                    step={0.01}
                    value={[formState.frequencyPenalty ?? 0]}
                    onValueChange={(value) =>
                      handleChange("frequencyPenalty", value[0])
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="presencePenalty">
                      Presence Penalty:{" "}
                      {formState.presencePenalty?.toFixed(2) ?? "0.00"}
                    </Label>
                  </div>
                  <Slider
                    id="presencePenalty"
                    min={-2}
                    max={2}
                    step={0.01}
                    value={[formState.presencePenalty ?? 0]}
                    onValueChange={(value) =>
                      handleChange("presencePenalty", value[0])
                    }
                  />
                </div>
              </>
            )}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t">
        <Button onClick={handleSave} className="w-full">
          <Save size={16} className="mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
