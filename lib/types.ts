export type DocumentStatus = "PROCESSING" | "READY" | "ERROR";
export type MessageRole = "user" | "assistant";

export interface SearchResult {
  chunkId: string;
  content: string;
  score: number;
  chunkIndex: number;
  pageNumber?: number | null;
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface DocumentWithStats {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  status: DocumentStatus;
  pageCount?: number | null;
  wordCount?: number | null;
  summary?: string | null;
  insights?: string | null;
  createdAt: Date;
  _count?: {
    conversations: number;
  };
}
