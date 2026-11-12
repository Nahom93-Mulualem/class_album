import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, AUTH_COOKIE_NAME, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // In production, block unauthorized admin restoration to prevent backdoors
    const secret = req.headers.get("x-admin-secret") || req.nextUrl.searchParams.get("secret");
    const validSecret = process.env.ADMIN_RESTORE_SECRET;
    if (process.env.NODE_ENV === "production" && (!validSecret || secret !== validSecret)) {
      return NextResponse.json(
        { error: "Forbidden. Admin restore is locked in production." },
        { status: 403 }
      );
    }

    // 1. Check if admin exists in database
    let admin = await prisma.user.findFirst({
      where: {
        OR: [{ username: "admin" }, { role: "ADMIN" }],
      },
    });

    const hashedPassword = await hashPassword("admin123");

    if (!admin) {
      // Create admin user if not found
      admin = await prisma.user.create({
        data: {
          username: "admin",
          email: "admin@phoenix2026.edu",
          password: hashedPassword,
          name: "Alex Chen (Admin)",
          avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDMLGCNKFCr7a7iihM-ILAGx8wgcjhWgZ6G9lJSFTgXX8c4dhm_MAMiOziO1tPRIZaGgUvGtj3JyOqKyMhS6EWpNky4VhuTuknCyMt2oOsex1Fyx05WN93WpuKdhefX1W3Ma7HeRAXg1V3KV7DQnTSnAqLGOLja6D0RFGfkWrDAVJjJMEpzzIYxzuGGz8wX8eJaIWkzL6xquakSbjuJHPk7TyZZEMh8CfC2-Bo7omnHCyl-El_nMOaoKA",
          role: "ADMIN",
          isActive: true,
          degree: "B.S. Software Engineering",
          gradYear: "2026",
          track: "Full-Stack & AI Systems",
          statusQuote: "Administrator for Phoenix Software Engineering Batch of 2026 🎓",
          bio: "Senior class representative and system administrator for the Phoenix 2026 platform.",
          skills: ["TypeScript", "Next.js", "Python", "Rust", "Database Admin", "Security"],
          connected: true,
          online: true,
        },
      });
    } else {
      // Update and ensure active and ADMIN role
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: {
          role: "ADMIN",
          isActive: true,
          password: hashedPassword,
        },
      });
    }

    // 2. Issue a session token for the admin
    const token = await createSessionToken({
      id: admin.id,
      username: admin.username,
      role: "ADMIN",
      name: admin.name,
      avatar: admin.avatar,
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin authority restored successfully! Welcome back, Admin.",
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        avatar: admin.avatar,
        role: "ADMIN",
        isActive: true,
        degree: admin.degree,
        gradYear: admin.gradYear,
        track: admin.track,
        statusQuote: admin.statusQuote,
        bio: admin.bio,
        dorm: admin.dorm,
        skills: admin.skills,
        github: admin.github,
        linkedin: admin.linkedin,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Restore admin error:", error);
    return NextResponse.json(
      { error: "Failed to restore admin authority." },
      { status: 500 }
    );
  }
}
