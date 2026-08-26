import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parsePDF, chunkText } from "@/lib/pdf";
import { canUploadDocument } from "@/lib/limits";

export const maxDuration = 60;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { conversations: true } } },
  });

  return NextResponse.json(documents);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { documents: true } } },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.includes("pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  const check = canUploadDocument(user._count.documents, file.size);

  if (!check.allowed) {
    return NextResponse.json({ error: check.reason }, { status: 403 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const document = await prisma.document.create({
    data: {
      name: file.name,
      size: file.size,
      mimeType: file.type,
      status: "PROCESSING",
      userId: session.user.id,
    },
  });

  await processPDF(document.id, buffer);

  const ready = await prisma.document.findUnique({ where: { id: document.id } });

  return NextResponse.json(ready ?? document, { status: 201 });
}

async function processPDF(documentId: string, buffer: Buffer) {
  try {
    const { text, pageCount, wordCount } = await parsePDF(buffer);
    const chunks = chunkText(text);

    await prisma.document.update({
      where: { id: documentId },
      data: { pageCount, wordCount },
    });

    await prisma.documentChunk.createMany({
      data: chunks.map((chunk) => ({
        documentId,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber ?? null,
      })),
    });

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "READY" },
    });
  } catch (error) {
    console.error("PDF processing error:", error);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "ERROR" },
    });
  }
}
