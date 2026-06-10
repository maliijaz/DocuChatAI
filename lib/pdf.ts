interface ParsedPDF {
  text: string;
  pageCount: number;
  wordCount: number;
}

interface Chunk {
  content: string;
  chunkIndex: number;
  pageNumber?: number;
}

export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);

  const text = data.text.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return {
    text,
    pageCount: data.numpages,
    wordCount,
  };
}

export function chunkText(
  text: string,
  chunkSize = 1200,
  overlap = 200
): Chunk[] {
  const chunks: Chunk[] = [];
  const cleanText = text.replace(/\n{3,}/g, "\n\n").trim();

  if (cleanText.length <= chunkSize) {
    return [{ content: cleanText, chunkIndex: 0 }];
  }

  // Split by paragraphs first for more natural chunks
  const paragraphs = cleanText.split(/\n\n+/);
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    if (
      currentChunk.length + trimmed.length + 2 > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({ content: currentChunk.trim(), chunkIndex: chunkIndex++ });
      // Keep overlap
      const words = currentChunk.split(" ");
      const overlapWords = words.slice(-Math.floor(overlap / 6));
      currentChunk = overlapWords.join(" ") + "\n\n" + trimmed;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({ content: currentChunk.trim(), chunkIndex: chunkIndex });
  }

  // If no paragraph splits worked (dense text), fall back to sliding window
  if (chunks.length === 0) {
    let start = 0;
    let idx = 0;
    while (start < cleanText.length) {
      chunks.push({
        content: cleanText.slice(start, start + chunkSize),
        chunkIndex: idx++,
      });
      start += chunkSize - overlap;
    }
  }

  return chunks;
}
