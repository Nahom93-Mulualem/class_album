import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    const where: {
      OR?: Array<
        | { name: { contains: string; mode: "insensitive" } }
        | { username: { contains: string; mode: "insensitive" } }
        | { email: { contains: string; mode: "insensitive" } }
        | { track: { contains: string; mode: "insensitive" } }
      >;
      role?: "STUDENT" | "ADMIN";
      isActive?: boolean;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { track: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && (role === "STUDENT" || role === "ADMIN")) {
      where.role = role;
    }

    if (status === "ACTIVE") {
      where.isActive = true;
    } else if (status === "DEACTIVATED") {
      where.isActive = false;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        degree: true,
        gradYear: true,
        track: true,
        statusQuote: true,
        bio: true,
        dorm: true,
        skills: true,
        github: true,
        linkedin: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin get users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      username,
      email,
      password,
      name,
      avatar,
      role,
      track,
      bio,
      skills,
      dorm,
      github,
      linkedin,
      statusQuote,
    } = body;

    if (!username || !email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { email: cleanEmail },
          { username: { equals: cleanUsername, mode: "insensitive" } },
          { email: { equals: cleanEmail, mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username or email already exists in database." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(cleanPassword);

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        name: name.trim(),
        avatar:
          avatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        role: role === "ADMIN" ? "ADMIN" : "STUDENT",
        isActive: true,
        degree: "B.S. Software Engineering",
        gradYear: "2026",
        track: track?.trim() || "Full-Stack & Cloud Architecture",
        statusQuote: statusQuote?.trim() || "Excited for senior graduation! 🎓",
        bio: bio?.trim() || "Senior Software Engineering student at Phoenix Class of 2026.",
        dorm: dorm?.trim() || "Campus Residential",
        skills: Array.isArray(skills) && skills.length > 0 ? skills : ["TypeScript", "Full-Stack"],
        github: github?.trim() || cleanUsername,
        linkedin: linkedin?.trim() || null,
        connected: true,
        online: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action, newPassword, role, name, track, bio, isActive } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "TOGGLE_ACTIVE") {
      const nextStatus = typeof isActive === "boolean" ? isActive : !targetUser.isActive;
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isActive: nextStatus },
      });
      return NextResponse.json({
        success: true,
        message: `User ${targetUser.name} is now ${nextStatus ? "Active" : "Deactivated"}`,
        user: updated,
      });
    }

    if (action === "RESET_PASSWORD") {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long." },
          { status: 400 }
        );
      }
      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
      return NextResponse.json({
        success: true,
        message: `Password for ${targetUser.name} reset successfully!`,
      });
    }

    if (action === "CHANGE_ROLE") {
      if (role !== "ADMIN" && role !== "STUDENT") {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
      return NextResponse.json({
        success: true,
        message: `User ${targetUser.name} role changed to ${role}`,
        user: updated,
      });
    }

    if (action === "UPDATE_DETAILS") {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || targetUser.name,
          track: track || targetUser.track,
          bio: bio !== undefined ? bio : targetUser.bio,
        },
      });
      return NextResponse.json({
        success: true,
        message: `Profile updated for ${targetUser.name}`,
        user: updated,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (userId === currentUser.id) {
      return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
