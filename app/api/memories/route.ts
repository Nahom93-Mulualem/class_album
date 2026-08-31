import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { INITIAL_MEMORIES } from "@/app/data/initialData";

export async function GET() {
  try {
    const currentUser = await getCurrentUserFromCookie();

    let memories = await prisma.memory.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
        },
        likes: true,
      },
    });

    // If database has no memories yet, seed initial memories to PostgreSQL
    if (memories.length === 0) {
      try {
        const fallbackUser =
          (await prisma.user.findFirst({ select: { id: true, name: true, avatar: true } })) || {
            id: currentUser?.id || "user-admin",
            name: "Phoenix Classmate",
            avatar: "/phoenix-logo.png",
          };

        for (const init of INITIAL_MEMORIES) {
          const authorUser = await prisma.user.findUnique({
            where: { id: init.authorId },
            select: { id: true, name: true, avatar: true },
          });
          const targetAuthorId = authorUser ? authorUser.id : fallbackUser.id;

          await prisma.memory.create({
            data: {
              id: init.id,
              title: init.title,
              story: init.story,
              image: init.image || null,
              video: init.video || null,
              category: init.category,
              year: init.year,
              date: init.date,
              location: init.location,
              aspect: init.aspect || "featured",
              authorId: targetAuthorId,
              authorName: init.authorName || fallbackUser.name,
              authorAvatar: init.authorAvatar || fallbackUser.avatar,
              taggedClassmates: init.taggedClassmates ? JSON.stringify(init.taggedClassmates) : null,
              likesCount: init.likesCount || 0,
              comments: {
                create: (init.comments || []).map((c) => ({
                  authorName: c.authorName,
                  authorAvatar: c.authorAvatar,
                  authorTrack: c.authorTrack || "Software Engineering",
                  timeAgo: c.timeAgo,
                  content: c.content,
                })),
              },
            },
          });
        }

        memories = await prisma.memory.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            comments: {
              orderBy: { createdAt: "asc" },
            },
            likes: true,
          },
        });
      } catch (seedError) {
        console.error("Auto-seed memories error:", seedError);
      }
    }

    const formatted = memories.map((m) => {
      let parsedTagged: { id: string; name: string; avatar: string }[] = [];
      if (m.taggedClassmates) {
        try {
          parsedTagged = JSON.parse(m.taggedClassmates);
        } catch {
          parsedTagged = [];
        }
      }

      const isLiked = currentUser
        ? m.likes.some((l) => l.userId === currentUser.id)
        : false;

      return {
        id: m.id,
        title: m.title,
        story: m.story,
        image: m.image || "",
        video: m.video || undefined,
        category: m.category,
        year: m.year,
        date: m.date,
        location: m.location,
        aspect: m.aspect as "tall" | "wide" | "square" | "featured",
        authorId: m.authorId,
        authorName: m.authorName,
        authorAvatar: m.authorAvatar,
        taggedClassmates: parsedTagged,
        likesCount: m.likesCount,
        isLiked,
        comments: m.comments.map((c) => ({
          id: c.id,
          authorName: c.authorName,
          authorAvatar: c.authorAvatar,
          authorTrack: c.authorTrack || undefined,
          timeAgo: c.timeAgo,
          content: c.content,
        })),
      };
    });

    return NextResponse.json({ memories: formatted });
  } catch (error) {
    console.error("Fetch memories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch memories", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser) {
      return NextResponse.json({ error: "Please log in to upload a memory" }, { status: 401 });
    }

    if (!currentUser.isActive) {
      return NextResponse.json(
        { error: "Your account is deactivated. You cannot upload memories." },
        { status: 403 }
      );
    }

    const {
      title,
      story,
      category,
      year,
      date,
      location,
      image,
      video,
      aspect,
      taggedClassmates,
    } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Memory title is required" }, { status: 400 });
    }

    if (!story || !story.trim()) {
      return NextResponse.json({ error: "Memory story is required" }, { status: 400 });
    }

    if (!image && !video) {
      return NextResponse.json(
        { error: "Please provide at least an image or video" },
        { status: 400 }
      );
    }

    const newMemory = await prisma.memory.create({
      data: {
        title: title.trim(),
        story: story.trim(),
        category: category || "Graduation",
        year: year || "2026",
        date: date?.trim() || "May 2026",
        location: location?.trim() || "Main Campus Quad",
        aspect: aspect || "featured",
        image: image || null,
        video: video || null,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        taggedClassmates: taggedClassmates ? JSON.stringify(taggedClassmates) : null,
        likesCount: 0,
      },
      include: {
        comments: true,
        likes: true,
      },
    });

    return NextResponse.json({
      success: true,
      memory: {
        id: newMemory.id,
        title: newMemory.title,
        story: newMemory.story,
        image: newMemory.image || "",
        video: newMemory.video || undefined,
        category: newMemory.category,
        year: newMemory.year,
        date: newMemory.date,
        location: newMemory.location,
        aspect: newMemory.aspect,
        authorId: newMemory.authorId,
        authorName: newMemory.authorName,
        authorAvatar: newMemory.authorAvatar,
        taggedClassmates: taggedClassmates || [],
        likesCount: 0,
        isLiked: false,
        comments: [],
      },
    });
  } catch (error) {
    console.error("Create memory error:", error);
    return NextResponse.json(
      { error: "Failed to upload memory", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memoryId = searchParams.get("memoryId");

    if (!memoryId) {
      return NextResponse.json({ error: "Memory ID is required" }, { status: 400 });
    }

    const memory = await prisma.memory.findUnique({
      where: { id: memoryId },
    });

    if (!memory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    if (currentUser.role !== "ADMIN" && memory.authorId !== currentUser.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only delete your own memories unless you are an Admin." },
        { status: 403 }
      );
    }

    await prisma.memory.delete({
      where: { id: memoryId },
    });

    return NextResponse.json({
      success: true,
      message: `Memory "${memory.title}" deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete memory error:", error);
    return NextResponse.json(
      { error: "Failed to delete memory", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
