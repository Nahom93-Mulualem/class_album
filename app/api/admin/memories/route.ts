import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category") || "";

    const where: {
      OR?: Array<
        | { title: { contains: string; mode: "insensitive" } }
        | { story: { contains: string; mode: "insensitive" } }
        | { authorName: { contains: string; mode: "insensitive" } }
        | { location: { contains: string; mode: "insensitive" } }
      >;
      category?: string;
    } = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { story: { contains: search, mode: "insensitive" } },
        { authorName: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All") {
      where.category = category;
    }

    const memories = await prisma.memory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            track: true,
            role: true,
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return NextResponse.json({ memories });
  } catch (error) {
    console.error("Admin get memories error:", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const memoryId = searchParams.get("memoryId");

    if (!memoryId) {
      return NextResponse.json({ error: "Memory ID is required" }, { status: 400 });
    }

    const targetMemory = await prisma.memory.findUnique({
      where: { id: memoryId },
    });

    if (!targetMemory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    // Cascading delete automatically removes MemoryComments and MemoryLikes via Prisma relation
    await prisma.memory.delete({
      where: { id: memoryId },
    });

    return NextResponse.json({
      success: true,
      message: `Memory "${targetMemory.title}" and all associated comments/likes deleted successfully.`,
    });
  } catch (error) {
    console.error("Admin delete memory error:", error);
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
