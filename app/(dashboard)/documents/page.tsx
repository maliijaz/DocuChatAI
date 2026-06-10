"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { UploadArea } from "@/components/documents/upload-area";
import { DocumentCard } from "@/components/documents/document-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, RefreshCw, AlertCircle } from "lucide-react";

interface Document {
  id: string;
  name: string;
  size: number;
  status: string;
  pageCount?: number;
  wordCount?: number;
  createdAt: string;
  _count?: { conversations: number };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data);
    } catch {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Poll for processing documents
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "PROCESSING");
    if (!hasProcessing) return;

    const interval = setInterval(fetchDocuments, 3000);
    return () => clearInterval(interval);
  }, [documents]);

  const handleUploadComplete = (newDoc: { id: string; name: string }) => {
    fetchDocuments();
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <DashboardHeader
        title="Documents"
        description="Upload PDFs and start intelligent conversations with them."
      />

      <UploadArea onUploadComplete={handleUploadComplete} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">
            Your documents
            {documents.length > 0 && (
              <span className="text-muted-foreground font-normal text-sm ml-2">
                ({documents.length})
              </span>
            )}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDocuments}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 rounded-xl border-2 border-dashed">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">No documents yet</h3>
            <p className="text-muted-foreground text-sm">
              Upload your first PDF to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
