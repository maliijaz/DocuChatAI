"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, formatBytes } from "@/lib/utils";
import { toast } from "sonner";

interface UploadAreaProps {
  onUploadComplete: (document: { id: string; name: string }) => void;
  maxSizeMB?: number;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function UploadArea({ onUploadComplete, maxSizeMB = 25 }: UploadAreaProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setStatus("idle");
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024,
    onDropRejected: (files) => {
      const err = files[0]?.errors[0];
      if (err?.code === "file-too-large") {
        setError(`File exceeds ${maxSizeMB}MB limit`);
      } else {
        setError("Only PDF files are accepted");
      }
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setProgress(10);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress(40);
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      setProgress(80);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setProgress(100);
      setStatus("success");
      toast.success(`"${file.name}" uploaded successfully!`);
      onUploadComplete(data);

      setTimeout(() => {
        setFile(null);
        setStatus("idle");
        setProgress(0);
      }, 2000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
      toast.error("Upload failed");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-all cursor-pointer",
            isDragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {isDragActive ? "Drop your PDF here" : "Upload a PDF document"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag & drop or click to browse · Max {maxSizeMB}MB
          </p>
          <Button variant="outline" size="sm" type="button">
            Choose file
          </Button>

          {error && (
            <p className="mt-3 text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              {status === "success" ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : status === "error" ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <FileText className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            {status === "idle" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={reset}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {status === "uploading" && (
            <Progress value={progress} className="mb-3" />
          )}

          {status === "error" && error && (
            <p className="text-sm text-destructive mb-3">{error}</p>
          )}

          <div className="flex gap-2">
            {(status === "idle" || status === "error") && (
              <>
                <Button
                  onClick={handleUpload}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
                <Button variant="outline" onClick={reset}>
                  Cancel
                </Button>
              </>
            )}
            {status === "uploading" && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Processing your document...
              </p>
            )}
            {status === "success" && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                Document uploaded and processing!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
