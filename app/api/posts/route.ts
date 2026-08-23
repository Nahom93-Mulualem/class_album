import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUserFromCookie();

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
        },
        likes: true,
      },
    });

    const formattedPosts = posts.map((p) => {
      const isLiked = currentUser
        ? p.likes.some((l) => l.userId === currentUser.id)
        : false;
      return {
        id: p.id,
        authorId: p.authorId,
        authorName: p.authorName,
        authorAvatar: p.authorAvatar,
        authorTrack: p.authorTrack,
        timeAgo: p.timeAgo,
        content: p.content,
        image: p.image || undefined,
        video: p.video || undefined,
        tag: p.tag as "Career & Offers" | "Campus Life" | "Hackathons & Tech" | "Projects",
        likesCount: p.likesCount,
        isLiked,
        comments: p.comments.map((c) => ({
          id: c.id,
          authorName: c.authorName,
          authorAvatar: c.authorAvatar,
          authorTrack: c.authorTrack,
          timeAgo: c.timeAgo,
          content: c.content,
        })),
      };
    });

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser) {
      return NextResponse.json({ error: "Please log in to create a post" }, { status: 401 });
    }

    if (!currentUser.isActive) {
      return NextResponse.json(
        { error: "Your account is deactivated. You cannot post." },
        { status: 403 }
      );
    }

    const { content, tag, image, video } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Post content cannot be empty" }, { status: 400 });
    }

    const newPost = await prisma.post.create({
      data: {
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        authorTrack: currentUser.track,
        timeAgo: "Just now",
        content: content.trim(),
        tag: tag || "Projects",
        image: image || null,
        video: video || null,
        likesCount: 0,
      },
      include: {
        comments: true,
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        authorId: newPost.authorId,
        authorName: newPost.authorName,
        authorAvatar: newPost.authorAvatar,
        authorTrack: newPost.authorTrack,
        timeAgo: newPost.timeAgo,
        content: newPost.content,
        image: newPost.image || undefined,
        video: newPost.video || undefined,
        tag: newPost.tag,
        likesCount: 0,
        isLiked: false,
        comments: [],
      },
    });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
