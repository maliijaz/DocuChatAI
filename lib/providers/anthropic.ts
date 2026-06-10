import Anthropic from "@anthropic-ai/sdk";
import { SearchResult, ChatMessage } from "../types";
import { buildSystemPrompt } from "./shared";

function getAnthropic(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key === "your-anthropic-api-key-here") {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }
  return new Anthropic({ apiKey: key });
}

export async function chatWithAnthropic(
  userMessage: string,
  relevantChunks: SearchResult[],
  history: ChatMessage[],
  model: string
): Promise<ReadableStream> {
  const anthropic = getAnthropic();
  const systemPrompt = buildSystemPrompt(relevantChunks);

  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  const stream = anthropic.messages.stream({
    model,
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
              )
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

export async function generateSummaryAnthropic(
  text: string,
  model: string
): Promise<string> {
  const anthropic = getAnthropic();
  const truncated = text.slice(0, 60000);
  const response = await anthropic.messages.create({
    model,
    max_tokens: 2000,
    system: "You are an expert document analyst. Create structured, comprehensive summaries.",
    messages: [
      {
        role: "user",
        content: `Analyze and summarize this document:\n\n${truncated}\n\nProvide a structured summary with:\n## Executive Summary\n(2-3 sentence overview)\n\n## Main Topics\n(Bullet points of key subjects covered)\n\n## Key Findings & Insights\n(Most important information and takeaways)\n\n## Important Data & Statistics\n(Numbers, dates, metrics if present)\n\n## Conclusions\n(Final conclusions or recommendations)`,
      },
    ],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function extractKeyInsightsAnthropic(
  text: string,
  model: string
): Promise<string> {
  const anthropic = getAnthropic();
  const truncated = text.slice(0, 40000);
  const response = await anthropic.messages.create({
    model,
    max_tokens: 1200,
    messages: [
      {
        role: "user",
        content: `Extract the 5-10 most important insights from this document and format them as a clear, numbered list with brief explanations:\n\n${truncated}`,
      },
    ],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}
