import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
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
      _count: { select: { conversations: true, chunks: true } },
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id, userId: session.user.id },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Delete file from disk
  try {
    const filePath = path.join(process.cwd(), "uploads", document.filePath);
    await unlink(filePath);
  } catch {
    // File might not exist, continue with DB deletion
  }

  await prisma.document.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
