"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Sparkles,
  Loader2,
  RefreshCw,
  MessageSquare,
  History,
  Trash2,
  Plus,
  Lightbulb,
} from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { ModelSelector } from "./model-selector";
import { DocumentInsights } from "@/components/documents/document-insights";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from "@/lib/models";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { index: number; page?: number; excerpt: string }[];
  createdAt?: Date;
}

interface Conversation {
  id: string;
  title?: string;
  updatedAt?: string;
  messages: Message[];
}

interface ChatInterfaceProps {
  documentId: string;
  documentName: string;
  documentStatus: string;
  hasSummary?: boolean;
  hasInsights?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "What is this document about?",
  "Summarize the key findings",
  "What are the main conclusions?",
  "List the most important points",
];

export function ChatInterface({
  documentId,
  documentStatus,
  hasSummary,
  hasInsights,
}: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/documents/${documentId}/chat`);
        if (res.ok) {
          const convs: Conversation[] = await res.json();
          setConversations(convs);
          if (convs.length > 0) {
            const latest = convs[0];
            setActiveConvId(latest.id);
            setMessages(latest.messages);
          }
        }
      } catch {}
      setLoadingHistory(false);
    }
    loadHistory();
  }, [documentId]);

  const switchConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages);
  };

  const deleteConversation = async (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(
        `/api/documents/${documentId}/chat?conversationId=${conv.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete conversation");
      setConversations((prev) => prev.filter((c) => c.id !== conv.id));
      if (activeConvId === conv.id) {
        setActiveConvId(null);
        setMessages([]);
      }
      toast.success("Conversation deleted");
    } catch {
      toast.error("Failed to delete conversation");
    }
  };

  const sendMessage = async (messageText?: string) => {
    const msg = (messageText ?? input).trim();
    if (!msg || loading || streaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setStreaming(true);
    setStreamingMessage("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch(`/api/documents/${documentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, conversationId: activeConvId, model: selectedModel }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        let errorMessage = "Chat failed";
        try {
          const err = await res.json();
          errorMessage = err.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const newConvId = res.headers.get("X-Conversation-Id");
      const isNewConversation = newConvId && !activeConvId;
      if (isNewConversation) setActiveConvId(newConvId);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const { text } = JSON.parse(data);
              fullText += text;
              setStreamingMessage(fullText);
            } catch {}
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fullText,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (isNewConversation && newConvId) {
        setConversations((prev) => [
          { id: newConvId, title: msg.slice(0, 60), messages: [] },
          ...prev,
        ]);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error(err.message || "Failed to get response");
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      }
    } finally {
      setStreaming(false);
      setStreamingMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  if (documentStatus !== "READY") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">Processing document...</h3>
        <p className="text-sm text-muted-foreground">
          Your document is being analyzed. This usually takes a few seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card/50 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium text-sm">Chat</span>
            {messages.length > 0 && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {messages.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={insightsOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setInsightsOpen((v) => !v)}
              className="gap-1.5 text-xs"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Insights
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <History className="h-3.5 w-3.5" />
                  History
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuItem onClick={startNewConversation} className="gap-2 cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />
                  New conversation
                </DropdownMenuItem>
                {conversations.length > 0 && <DropdownMenuSeparator />}
                {conversations.length === 0 ? (
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                    No past conversations yet
                  </DropdownMenuLabel>
                ) : (
                  conversations.map((conv) => (
                    <DropdownMenuItem
                      key={conv.id}
                      onClick={() => switchConversation(conv)}
                      className={`flex items-center justify-between gap-2 cursor-pointer ${
                        conv.id === activeConvId ? "bg-accent" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm">{truncate(conv.title || "Untitled chat", 40)}</p>
                        {conv.updatedAt && (
                          <p className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(conv.updatedAt)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conv, e)}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <ModelSelector
              models={AVAILABLE_MODELS}
              selectedModelId={selectedModel}
              onModelChange={setSelectedModel}
              disabled={streaming}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewConversation}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              New chat
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className={`h-16 ${i % 2 === 0 ? "w-3/4 ml-auto" : "w-4/5"}`} />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Ask anything about this document
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                I can answer questions, generate summaries, extract key insights, and more.
              </p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted/30 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {streaming && streamingMessage && (
                <MessageBubble
                  message={{
                    id: "streaming",
                    role: "assistant",
                    content: streamingMessage,
                  }}
                  isStreaming
                />
              )}
              {streaming && !streamingMessage && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t bg-card/50 p-4">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this document..."
              className="resize-none min-h-[44px] max-h-[200px] flex-1"
              rows={1}
              disabled={streaming}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || streaming}
              size="icon"
              className="h-11 w-11 shrink-0"
            >
              {streaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {insightsOpen && (
        <DocumentInsights
          documentId={documentId}
          hasSummary={hasSummary}
          hasInsights={hasInsights}
          onClose={() => setInsightsOpen(false)}
        />
      )}
    </div>
  );
}
