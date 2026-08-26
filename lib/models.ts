export type ModelProvider = "groq";

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "openai/gpt-oss-20b",
    name: "GPT-OSS 20B",
    provider: "groq",
    description: "Fast and efficient — great for quick answers",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    provider: "groq",
    description: "Most capable open-weight model — best accuracy",
  },
];

export const DEFAULT_MODEL_ID = AVAILABLE_MODELS[0].id;

export function getModelConfig(modelId: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === modelId);
}

export function isValidModel(modelId: string): boolean {
  return AVAILABLE_MODELS.some((m) => m.id === modelId);
}

export function resolveModel(requestedModel?: string | null): string {
  return requestedModel && isValidModel(requestedModel) ? requestedModel : DEFAULT_MODEL_ID;
}
