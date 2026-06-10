import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateSummary } from "@/lib/ai";
import { getModelForPlan } from "@/lib/plans";
import { Plan } from "@/lib/types";

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

  // Check if summary already exists
  if (document.summary) {
    return NextResponse.json({ summary: document.summary });
  }

  const fullText = document.chunks.map((c) => c.content).join("\n\n");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  const model = getModelForPlan((user?.plan as Plan) ?? "FREE");

  const summary = await generateSummary(fullText, model);

  await prisma.document.update({
    where: { id: params.id },
    data: { summary },
  });

  return NextResponse.json({ summary });
}
