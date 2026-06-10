import { Plan } from "./types";

export type ModelProvider = "anthropic" | "groq";

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  badge: "Free" | "Pro";
  plans: Plan[];
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  // ── Free models (all plans) ──────────────────────────────────────────────
  {
    id: "llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    provider: "groq",
    description: "Meta's Llama via Groq — ultra-fast inference",
    badge: "Free",
    plans: ["FREE", "PRO", "ENTERPRISE"],
  },
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    provider: "groq",
    description: "Meta's most capable open model via Groq",
    badge: "Free",
    plans: ["FREE", "PRO", "ENTERPRISE"],
  },
  // ── Anthropic models (Pro / Enterprise only) ─────────────────────────────
  {
    id: "claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    description: "Anthropic's fastest model — ideal for quick answers",
    badge: "Pro",
    plans: ["PRO", "ENTERPRISE"],
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    description: "Anthropic's smartest model — best accuracy",
    badge: "Pro",
    plans: ["PRO", "ENTERPRISE"],
  },
];

export function getModelsForPlan(plan: Plan): ModelConfig[] {
  return AVAILABLE_MODELS.filter((m) => m.plans.includes(plan));
}

export function getModelConfig(modelId: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === modelId);
}

export function isModelAllowedForPlan(modelId: string, plan: Plan): boolean {
  const model = getModelConfig(modelId);
  return model ? model.plans.includes(plan) : false;
}

export function getDefaultModelForPlan(plan: Plan): string {
  if (plan === "FREE") return "llama-3.1-8b-instant";
  if (plan === "PRO") return "claude-haiku-4-5-20251001";
  return "claude-sonnet-4-6";
}
