
import { AzureOpenAIConfig } from "@/types/azure-openai";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { ChevronRight, Save } from "lucide-react";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ConfigPanelProps {
  config: AzureOpenAIConfig;
  onSaveConfig: (config: AzureOpenAIConfig) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ConfigPanel = ({ 
  config, 
  onSaveConfig, 
  isCollapsed,
  onToggleCollapse
}: ConfigPanelProps) => {
  const [formState, setFormState] = useState<AzureOpenAIConfig>(config);

  const handleSave = () => {
    onSaveConfig(formState);
    toast.success("Configuration saved");
  };

  const handleChange = (field: keyof AzureOpenAIConfig, value: string | number) => {
    setFormState(prev => ({ ...prev, [field]: value }));
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
    <div className={cn(
      "border-l bg-muted/30 dark:bg-muted/10 w-96 flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-10 p-0" : "p-4"
    )}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-medium">Configuration</h2>
        <button 
          onClick={onToggleCollapse}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="space-y-6 overflow-y-auto flex-1">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Azure OpenAI Settings</h3>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input 
              id="apiKey"
              type="password"
              value={formState.apiKey}
              onChange={(e) => handleChange("apiKey", e.target.value)}
              placeholder="Enter your Azure OpenAI API Key"
            />
          </div>
          
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
              onChange={(e) => handleChange("deploymentName", e.target.value)}
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
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Model Parameters</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Temperature: {formState.temperature.toFixed(2)}</Label>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.01}
              value={[formState.temperature]}
              onValueChange={(value) => handleChange("temperature", value[0])}
            />
            <p className="text-xs text-gray-500">Controls randomness: lower is more deterministic</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="maxTokens">Max Tokens: {formState.maxTokens}</Label>
            </div>
            <Slider
              id="maxTokens"
              min={50}
              max={8000}
              step={10}
              value={[formState.maxTokens]}
              onValueChange={(value) => handleChange("maxTokens", value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="topP">Top P: {formState.topP.toFixed(2)}</Label>
            </div>
            <Slider
              id="topP"
              min={0}
              max={1}
              step={0.01}
              value={[formState.topP]}
              onValueChange={(value) => handleChange("topP", value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="frequencyPenalty">Frequency Penalty: {formState.frequencyPenalty.toFixed(2)}</Label>
            </div>
            <Slider
              id="frequencyPenalty"
              min={-2}
              max={2}
              step={0.01}
              value={[formState.frequencyPenalty]}
              onValueChange={(value) => handleChange("frequencyPenalty", value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="presencePenalty">Presence Penalty: {formState.presencePenalty.toFixed(2)}</Label>
            </div>
            <Slider
              id="presencePenalty"
              min={-2}
              max={2}
              step={0.01}
              value={[formState.presencePenalty]}
              onValueChange={(value) => handleChange("presencePenalty", value[0])}
            />
          </div>
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
