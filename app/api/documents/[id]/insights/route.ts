import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractKeyInsights } from "@/lib/ai";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id, userId: session.user.id },
    include: {
      chunks: { orderBy: { chunkIndex: "asc" } },
    },
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

  if (document.insights) {
    return NextResponse.json({ insights: document.insights });
  }

  const fullText = document.chunks.map((c) => c.content).join("\n\n");
  const insights = await extractKeyInsights(fullText);

  await prisma.document.update({
    where: { id: params.id },
    data: { insights },
  });

  return NextResponse.json({ insights });
}
