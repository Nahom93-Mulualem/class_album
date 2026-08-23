import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser) {
      return NextResponse.json({ error: "Please log in to like posts" }, { status: 401 });
    }

    const { id: postId } = await params;

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: currentUser.id,
        },
      },
    });

    let isLiked = false;
    let likesCountChange = 0;

    if (existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      likesCountChange = -1;
      isLiked = false;
    } else {
      await prisma.postLike.create({
        data: {
          postId,
          userId: currentUser.id,
        },
      });
      likesCountChange = 1;
      isLiked = true;
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        likesCount: {
          increment: likesCountChange,
        },
      },
    });

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount: Math.max(0, updatedPost.likesCount),
    });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
