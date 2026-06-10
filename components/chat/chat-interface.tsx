"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send,
  Sparkles,
  Loader2,
  FileText,
  RefreshCw,
  BookOpen,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { ModelSelector } from "./model-selector";
import { getModelsForPlan, getDefaultModelForPlan } from "@/lib/models";
import { Plan } from "@/lib/types";
import { cn } from "@/lib/utils";
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
  messages: Message[];
}

interface ChatInterfaceProps {
  documentId: string;
  documentName: string;
  documentStatus: string;
  userPlan?: Plan;
}

const SUGGESTED_QUESTIONS = [
  "What is this document about?",
  "Summarize the key findings",
  "What are the main conclusions?",
  "List the most important points",
];

export function ChatInterface({
  documentId,
  documentName,
  documentStatus,
  userPlan = "FREE",
}: ChatInterfaceProps) {
  const availableModels = getModelsForPlan(userPlan);
  const defaultModel = getDefaultModelForPlan(userPlan);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
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

  // Load conversation history
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
      if (newConvId && !activeConvId) setActiveConvId(newConvId);

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
    <div className="flex flex-col h-full">
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
          <ModelSelector
            models={availableModels}
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
  );
}
