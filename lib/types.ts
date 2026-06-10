export type Plan = "FREE" | "PRO" | "ENTERPRISE";
export type DocumentStatus = "PROCESSING" | "READY" | "ERROR";
export type MessageRole = "user" | "assistant";

export interface PlanLimits {
  maxDocuments: number;
  maxFileSizeMB: number;
  maxChatsPerDay: number;
  maxDocumentSizeMB: number;
  advancedModels: boolean;
  multiDocumentChat: boolean;
  priority: boolean;
}

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
  createdAt: Date;
  _count?: {
    conversations: number;
  };
}
