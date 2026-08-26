import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, FileDigit, Hash, Calendar } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";

export default async function DocumentChatPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const document = await prisma.document.findUnique({
    where: { id: params.id, userId: session.user.id },
    include: { _count: { select: { chunks: true, conversations: true } } },
  });

  if (!document) notFound();

  return (
    <div className="flex flex-col h-full -m-6 md:-m-8">
      <div className="flex items-center gap-4 px-6 py-4 border-b bg-card shrink-0">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href="/dashboard/documents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
          <FileText className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{document.name}</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-muted-foreground">{formatBytes(document.size)}</span>
            {document.pageCount && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileDigit className="h-3 w-3" />
                {document.pageCount} pages
              </span>
            )}
            {document.wordCount && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                {document.wordCount.toLocaleString()} words
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(document.createdAt)}
            </span>
          </div>
        </div>

        <Badge
          variant={
            document.status === "READY" ? "success" : document.status === "ERROR" ? "destructive" : "warning"
          }
        >
          {document.status === "READY" ? "Ready" : document.status === "PROCESSING" ? "Processing" : "Error"}
        </Badge>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatInterface
          documentId={document.id}
          documentName={document.name}
          documentStatus={document.status}
          hasSummary={!!document.summary}
          hasInsights={!!document.insights}
        />
      </div>
    </div>
  );
}
