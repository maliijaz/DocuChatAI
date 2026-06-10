import { SearchResult } from "./types";

interface Chunk {
  id: string;
  content: string;
  chunkIndex: number;
  pageNumber?: number | null;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

// BM25 relevance scoring algorithm
export function bm25Search(
  chunks: Chunk[],
  query: string,
  topK = 5,
  k1 = 1.5,
  b = 0.75
): SearchResult[] {
  if (chunks.length === 0) return [];

  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return chunks.slice(0, topK).map((c, i) => ({
    chunkId: c.id,
    content: c.content,
    score: 1,
    chunkIndex: c.chunkIndex,
    pageNumber: c.pageNumber,
  }));

  const tokenizedChunks = chunks.map((chunk) => tokenize(chunk.content));
  const N = chunks.length;

  // Compute IDF for each query term
  const idf: Record<string, number> = {};
  for (const term of queryTerms) {
    const df = tokenizedChunks.filter((tokens) => tokens.includes(term)).length;
    idf[term] = Math.log((N - df + 0.5) / (df + 0.5) + 1);
  }

  const avgDL =
    tokenizedChunks.reduce((sum, t) => sum + t.length, 0) / N || 1;

  const scores = chunks.map((chunk, i) => {
    const tokens = tokenizedChunks[i];
    const dl = tokens.length || 1;
    let score = 0;

    for (const term of queryTerms) {
      const tf = tokens.filter((t) => t === term).length;
      if (tf === 0) continue;
      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + (b * dl) / avgDL);
      score += idf[term] * (numerator / denominator);
    }

    return {
      chunkId: chunk.id,
      content: chunk.content,
      score,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
    };
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((r) => r.score > 0);
}

// Keyword highlighting helper for UI
export function highlightMatches(text: string, query: string): string {
  const terms = tokenize(query);
  let result = text;
  for (const term of terms) {
    const regex = new RegExp(`(${term})`, "gi");
    result = result.replace(regex, "<mark>$1</mark>");
  }
  return result;
}
