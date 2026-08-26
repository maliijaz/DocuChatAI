import { SearchResult, ChatMessage } from "./types";
import { resolveModel } from "./models";
import { chatWithGroq, generateSummaryGroq, extractKeyInsightsGroq } from "./providers/groq";

export async function chatWithDocument(
  userMessage: string,
  relevantChunks: SearchResult[],
  history: ChatMessage[],
  modelId?: string
): Promise<ReadableStream> {
  return chatWithGroq(userMessage, relevantChunks, history, resolveModel(modelId));
}

export async function generateSummary(text: string, modelId?: string): Promise<string> {
  return generateSummaryGroq(text, resolveModel(modelId));
}

export async function extractKeyInsights(text: string, modelId?: string): Promise<string> {
  return extractKeyInsightsGroq(text, resolveModel(modelId));
}
