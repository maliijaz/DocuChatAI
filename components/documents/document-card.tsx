"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FileText,
  MessageSquare,
  Trash2,
  Clock,
  FileDigit,
  MoreVertical,
  Loader2,
  Cpu,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    size: number;
    status: string;
    pageCount?: number | null;
    wordCount?: number | null;
    createdAt: string | Date;
    _count?: { conversations: number };
  };
  onDelete: (id: string) => void;
  basePath?: string;
}

export function DocumentCard({ document: doc, onDelete, basePath = "/dashboard/documents" }: DocumentCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Document deleted");
      onDelete(doc.id);
    } catch {
      toast.error("Failed to delete document");
      setDeleting(false);
    }
  };

  const statusConfig = {
    PROCESSING: {
      label: "Processing",
      variant: "warning" as const,
      icon: <Cpu className="h-3 w-3 animate-pulse" />,
    },
    READY: {
      label: "Ready",
      variant: "success" as const,
      icon: null,
    },
    ERROR: {
      label: "Error",
      variant: "destructive" as const,
      icon: <AlertCircle className="h-3 w-3" />,
    },
  };

  const status = statusConfig[doc.status as keyof typeof statusConfig] ?? statusConfig.PROCESSING;

  return (
    <div className="group rounded-xl border bg-card p-5 hover:shadow-md transition-all duration-200 hover:border-primary/30">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate" title={doc.name}>
              {doc.name}
            </p>
            <p className="text-xs text-muted-foreground">{formatBytes(doc.size)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={status.variant} className="gap-1">
            {status.icon}
            {status.label}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        {doc.pageCount && (
          <span className="flex items-center gap-1">
            <FileDigit className="h-3.5 w-3.5" />
            {doc.pageCount} pages
          </span>
        )}
        {doc._count && (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {doc._count.conversations} chats
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          <Clock className="h-3.5 w-3.5" />
          {formatRelativeTime(doc.createdAt)}
        </span>
      </div>

      <Button
        asChild
        className="w-full"
        size="sm"
        disabled={doc.status !== "READY"}
        variant={doc.status === "READY" ? "default" : "outline"}
      >
        <Link href={doc.status === "READY" ? `${basePath}/${doc.id}` : "#"}>
          {doc.status === "PROCESSING" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Processing...
            </>
          ) : doc.status === "ERROR" ? (
            <>
              <AlertCircle className="h-3.5 w-3.5" />
              Processing failed
            </>
          ) : (
            <>
              <MessageSquare className="h-3.5 w-3.5" />
              Open & Chat
            </>
          )}
        </Link>
      </Button>
    </div>
  );
}
