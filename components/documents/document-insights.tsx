"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileStack, Lightbulb, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentInsightsProps {
  documentId: string;
  hasSummary?: boolean;
  hasInsights?: boolean;
  onClose: () => void;
}

type Tab = "summary" | "insights";

export function DocumentInsights({
  documentId,
  hasSummary,
  hasInsights,
  onClose,
}: DocumentInsightsProps) {
  const [tab, setTab] = useState<Tab>("summary");
  const [summary, setSummary] = useState<string | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [fetchedSummary, setFetchedSummary] = useState(false);
  const [fetchedInsights, setFetchedInsights] = useState(false);

  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/summary`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate summary");
      setSummary(data.summary);
      setFetchedSummary(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  const generateInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/insights`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to extract insights");
      setInsights(data.insights);
      setFetchedInsights(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to extract insights");
    } finally {
      setLoadingInsights(false);
    }
  };

  const activeText = tab === "summary" ? summary : insights;
  const activeLoading = tab === "summary" ? loadingSummary : loadingInsights;
  const activeFetched = tab === "summary" ? fetchedSummary : fetchedInsights;
  const activeHadCache = tab === "summary" ? hasSummary : hasInsights;
  const generate = tab === "summary" ? generateSummary : generateInsights;

  return (
    <div className="flex flex-col h-full w-80 shrink-0 border-l bg-card/50">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="font-medium text-sm">Document insights</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1 p-2 border-b">
        <button
          onClick={() => setTab("summary")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors",
            tab === "summary" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
          )}
        >
          <FileStack className="h-3.5 w-3.5" />
          Summary
        </button>
        <button
          onClick={() => setTab("insights")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors",
            tab === "insights" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          Key insights
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeText ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeText}</ReactMarkdown>
              <Button
                variant="ghost"
                size="sm"
                onClick={generate}
                disabled={activeLoading}
                className="gap-1.5 text-xs mt-2 -ml-2"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-10 gap-3">
              <p className="text-sm text-muted-foreground max-w-[200px]">
                {tab === "summary"
                  ? "Generate a structured summary of this document."
                  : "Extract the most important insights from this document."}
              </p>
              <Button size="sm" onClick={generate} disabled={activeLoading} className="gap-1.5">
                {activeLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : tab === "summary" ? (
                  <FileStack className="h-3.5 w-3.5" />
                ) : (
                  <Lightbulb className="h-3.5 w-3.5" />
                )}
                {activeLoading
                  ? "Generating..."
                  : activeHadCache && !activeFetched
                  ? "Load"
                  : "Generate"}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
