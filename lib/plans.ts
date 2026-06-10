import { Plan, PlanLimits } from "./types";
import { getDefaultModelForPlan } from "./models";

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    maxDocuments: 3,
    maxFileSizeMB: 5,
    maxChatsPerDay: 20,
    maxDocumentSizeMB: 5,
    advancedModels: false,
    multiDocumentChat: false,
    priority: false,
  },
  PRO: {
    maxDocuments: 50,
    maxFileSizeMB: 50,
    maxChatsPerDay: 500,
    maxDocumentSizeMB: 50,
    advancedModels: true,
    multiDocumentChat: true,
    priority: true,
  },
  ENTERPRISE: {
    maxDocuments: Infinity,
    maxFileSizeMB: 200,
    maxChatsPerDay: Infinity,
    maxDocumentSizeMB: 200,
    advancedModels: true,
    multiDocumentChat: true,
    priority: true,
  },
};

export const PLAN_DETAILS = {
  FREE: {
    name: "Free",
    price: 0,
    description: "Perfect for individuals getting started",
    features: [
      "3 documents",
      "5MB per file",
      "20 chats per day",
      "Basic AI model",
      "Standard support",
    ],
    model: "claude-haiku-4-5-20251001",
  },
  PRO: {
    name: "Pro",
    price: 19,
    description: "For professionals and power users",
    features: [
      "50 documents",
      "50MB per file",
      "500 chats per day",
      "Advanced AI models",
      "Multi-document chat",
      "Priority support",
    ],
    model: "claude-sonnet-4-6",
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 79,
    description: "For teams and organizations",
    features: [
      "Unlimited documents",
      "200MB per file",
      "Unlimited chats",
      "Latest AI models",
      "Multi-document chat",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
    model: "claude-sonnet-4-6",
  },
};

export function getModelForPlan(plan: Plan): string {
  return getDefaultModelForPlan(plan);
}

export function canUploadDocument(
  plan: Plan,
  currentDocCount: number,
  fileSize: number
): { allowed: boolean; reason?: string } {
  const limits = PLAN_LIMITS[plan];
  if (currentDocCount >= limits.maxDocuments) {
    return {
      allowed: false,
      reason: `You've reached the ${limits.maxDocuments} document limit for the ${plan} plan.`,
    };
  }
  const fileSizeMB = fileSize / (1024 * 1024);
  if (fileSizeMB > limits.maxFileSizeMB) {
    return {
      allowed: false,
      reason: `File size exceeds the ${limits.maxFileSizeMB}MB limit for the ${plan} plan.`,
    };
  }
  return { allowed: true };
}
