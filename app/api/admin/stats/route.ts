import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const [
      totalUsers,
      activeUsers,
      deactivatedUsers,
      totalStudents,
      totalAdmins,
      totalPosts,
      totalComments,
      totalLikes,
      totalMessages,
      recentUsers,
      recentPosts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.postLike.count(),
      prisma.message.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          track: true,
          createdAt: true,
        },
      }),
      prisma.post.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { comments: true, likes: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        deactivatedUsers,
        totalStudents,
        totalAdmins,
        totalPosts,
        totalComments,
        totalLikes,
        totalMessages,
        dbStatus: "Healthy (PostgreSQL Connected)",
      },
      recentUsers,
      recentPosts,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
