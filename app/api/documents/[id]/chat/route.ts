import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bm25Search } from "@/lib/search";
import { chatWithDocument } from "@/lib/ai";
import { ChatMessage } from "@/lib/types";
import { resolveModel } from "@/lib/models";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().nullish(),
  model: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { message, conversationId, model: requestedModel } = parsed.data;

  // Verify document ownership
  const document = await prisma.document.findUnique({
    where: { id: params.id, userId: session.user.id },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (document.status !== "READY") {
    return NextResponse.json(
      { error: "Document is still processing" },
      { status: 400 }
    );
  }

  // Get or create conversation
  let conversation;
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, userId: session.user.id },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
    });
  }

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        documentId: params.id,
        userId: session.user.id,
        title: message.slice(0, 60),
      },
      include: { messages: true },
    });
  }

  // Save user message
  await prisma.message.create({
    data: {
      role: "user",
      content: message,
      conversationId: conversation.id,
    },
  });

  // Retrieve relevant chunks using BM25
  const chunks = await prisma.documentChunk.findMany({
    where: { documentId: params.id },
  });

  const results = bm25Search(
    chunks.map((c) => ({
      id: c.id,
      content: c.content,
      chunkIndex: c.chunkIndex,
      pageNumber: c.pageNumber,
    })),
    message,
    6
  );

  // Build conversation history
  const history: ChatMessage[] = (conversation.messages ?? []).slice(-10).map(
    (m) => ({ role: m.role as "user" | "assistant", content: m.content })
  );

  const model = resolveModel(requestedModel);

  // Stream response from AI provider
  let stream: ReadableStream;
  try {
    stream = await chatWithDocument(message, results, history, model);
  } catch (err) {
    console.error("AI provider error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI provider failed" },
      { status: 500 }
    );
  }

  // Collect full response to save to DB (in background after stream)
  let fullResponse = "";
  const [streamForClient, streamForSave] = stream.tee();

  // Background: collect and save
  (async () => {
    const reader = streamForSave.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const { text } = JSON.parse(line.slice(6));
            fullResponse += text;
          } catch {}
        }
      }
    }

    // Save assistant message and update conversation
    if (fullResponse) {
      await prisma.message.create({
        data: {
          role: "assistant",
          content: fullResponse,
          conversationId: conversation!.id,
          sources: JSON.stringify(
            results.map((r) => ({
              index: r.chunkIndex,
              page: r.pageNumber,
              excerpt: r.content.slice(0, 150),
            }))
          ),
        },
      });

      await prisma.conversation.update({
        where: { id: conversation!.id },
        data: { updatedAt: new Date() },
      });
    }
  })().catch(console.error);

  return new Response(streamForClient, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Conversation-Id": conversation.id,
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { documentId: params.id, userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json(conversations);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId, userId: session.user.id, documentId: params.id },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  await prisma.conversation.delete({ where: { id: conversationId } });

  return NextResponse.json({ success: true });
}
