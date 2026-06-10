import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS, PLAN_DETAILS } from "@/lib/plans";
import { Plan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, MessageSquare, TrendingUp, ArrowRight, Clock, Plus } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [user, documents, recentMessages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { _count: { select: { documents: true } } },
    }),
    prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { conversations: true } } },
    }),
    prisma.message.findMany({
      where: { conversation: { userId: session.user.id }, role: "user" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { conversation: { include: { document: true } } },
    }),
  ]);

  if (!user) redirect("/login");

  const plan = (user.plan as Plan) ?? "FREE";
  const limits = PLAN_LIMITS[plan];
  const planDetails = PLAN_DETAILS[plan];
  const docCount = user._count.documents;
  const docUsagePercent =
    limits.maxDocuments === Infinity
      ? 0
      : Math.round((docCount / limits.maxDocuments) * 100);

  function getTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Good {getTimeOfDay()}, {user.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here&apos;s an overview of your workspace.</p>
        </div>
        <Button asChild variant="gradient" size="sm" className="gap-2">
          <Link href="/dashboard/documents">
            <Plus className="h-4 w-4" />
            Upload document
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Documents</span>
              <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
            <div className="text-2xl font-bold">{docCount}</div>
            <div className="mt-2">
              {limits.maxDocuments !== Infinity ? (
                <>
                  <Progress value={docUsagePercent} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {docCount} / {limits.maxDocuments} used
                  </p>
                </>
              ) : (
                <p className="text-xs text-emerald-600">Unlimited</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Conversations</span>
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold">
              {documents.reduce((s, d) => s + d._count.conversations, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total chats</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Plan</span>
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-2xl font-bold">{planDetails.name}</div>
            {plan === "FREE" ? (
              <Link href="/dashboard/billing" className="text-xs text-primary hover:underline mt-1 inline-block">
                Upgrade to Pro →
              </Link>
            ) : (
              <p className="text-xs text-emerald-600 mt-1">Active subscription</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent documents</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/dashboard/documents">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No documents yet</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/dashboard/documents">Upload your first PDF</Link>
                </Button>
              </div>
            ) : (
              documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={doc.status === "READY" ? `/dashboard/documents/${doc.id}` : "#"}
                  className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted transition-colors"
                >
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc._count.conversations} chats · {formatRelativeTime(doc.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={doc.status === "READY" ? "success" : doc.status === "ERROR" ? "destructive" : "warning"}
                    className="shrink-0 text-[10px]"
                  >
                    {doc.status === "READY" ? "Ready" : doc.status === "PROCESSING" ? "Processing" : "Error"}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {recentMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              recentMessages.map((msg) => (
                <Link
                  key={msg.id}
                  href={`/dashboard/documents/${msg.conversation.documentId}`}
                  className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{msg.conversation.document.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{msg.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(msg.createdAt)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
