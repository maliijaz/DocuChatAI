import { SearchResult, ChatMessage } from "./types";
import { getModelConfig, getDefaultModelForPlan } from "./models";
import { chatWithAnthropic, generateSummaryAnthropic, extractKeyInsightsAnthropic } from "./providers/anthropic";
import { chatWithGroq, generateSummaryGroq, extractKeyInsightsGroq } from "./providers/groq";

export async function chatWithDocument(
  userMessage: string,
  relevantChunks: SearchResult[],
  history: ChatMessage[],
  modelId = getDefaultModelForPlan("FREE")
): Promise<ReadableStream> {
  const config = getModelConfig(modelId);
  const provider = config?.provider ?? "groq";

  switch (provider) {
    case "anthropic":
      return chatWithAnthropic(userMessage, relevantChunks, history, modelId);
    case "groq":
      return chatWithGroq(userMessage, relevantChunks, history, modelId);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export async function generateSummary(text: string, modelId: string): Promise<string> {
  const config = getModelConfig(modelId);
  if (config?.provider === "groq") return generateSummaryGroq(text, modelId);
  return generateSummaryAnthropic(text, modelId);
}

export async function extractKeyInsights(text: string, modelId: string): Promise<string> {
  const config = getModelConfig(modelId);
  if (config?.provider === "groq") return extractKeyInsightsGroq(text, modelId);
  return extractKeyInsightsAnthropic(text, modelId);
}
