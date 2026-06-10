import Groq from "groq-sdk";
import { SearchResult, ChatMessage } from "../types";
import { buildSystemPrompt } from "./shared";

function getGroq(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured.");
  return new Groq({ apiKey: key });
}

export async function chatWithGroq(
  userMessage: string,
  relevantChunks: SearchResult[],
  history: ChatMessage[],
  model: string
): Promise<ReadableStream> {
  const groq = getGroq();
  const systemPrompt = buildSystemPrompt(relevantChunks);

  const stream = await groq.chat.completions.create({
    model,
    max_tokens: 2048,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ],
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

export async function generateSummaryGroq(
  text: string,
  model: string
): Promise<string> {
  const groq = getGroq();
  const truncated = text.slice(0, 60000);
  const response = await groq.chat.completions.create({
    model,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: "You are an expert document analyst. Create structured, comprehensive summaries.",
      },
      {
        role: "user",
        content: `Analyze and summarize this document:\n\n${truncated}\n\nProvide a structured summary with:\n## Executive Summary\n## Main Topics\n## Key Findings & Insights\n## Important Data & Statistics\n## Conclusions`,
      },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

export async function extractKeyInsightsGroq(
  text: string,
  model: string
): Promise<string> {
  const groq = getGroq();
  const truncated = text.slice(0, 40000);
  const response = await groq.chat.completions.create({
    model,
    max_tokens: 1200,
    messages: [
      {
        role: "user",
        content: `Extract the 5-10 most important insights from this document as a clear numbered list:\n\n${truncated}`,
      },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}
