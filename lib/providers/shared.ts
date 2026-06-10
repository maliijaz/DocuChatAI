import { SearchResult } from "../types";

export function buildSystemPrompt(relevantChunks: SearchResult[]): string {
  const contextText =
    relevantChunks.length > 0
      ? relevantChunks
          .map(
            (c, i) =>
              `[Excerpt ${i + 1}${c.pageNumber ? ` · Page ${c.pageNumber}` : ""}]\n${c.content}`
          )
          .join("\n\n---\n\n")
      : "No specific excerpts found. Answer based on general knowledge.";

  return `You are DocuChat AI, an intelligent assistant that helps users understand and extract insights from their documents.

DOCUMENT CONTEXT:
${contextText}

INSTRUCTIONS:
- Answer questions accurately using the document excerpts above
- Cite excerpts when relevant (e.g., "According to Excerpt 2...")
- If the answer isn't in the provided context, clearly state that
- Use markdown formatting for clarity (headers, bullet points, bold text)
- Be concise but thorough
- For summaries, cover main topics, key findings, and conclusions
- Never fabricate information not present in the document`;
}
