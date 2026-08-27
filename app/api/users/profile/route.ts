import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    if (!currentUser.isActive) {
      return NextResponse.json(
        { error: "Your account is deactivated. You cannot update your profile." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, track, statusQuote, bio, dorm, skills, github, linkedin } = body;

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(name && typeof name === "string" ? { name: name.trim() } : {}),
        ...(track && typeof track === "string" ? { track: track.trim() } : {}),
        ...(statusQuote !== undefined ? { statusQuote: typeof statusQuote === "string" ? statusQuote.trim() : null } : {}),
        ...(bio !== undefined ? { bio: typeof bio === "string" ? bio.trim() : null } : {}),
        ...(dorm !== undefined ? { dorm: typeof dorm === "string" ? dorm.trim() : null } : {}),
        ...(Array.isArray(skills) ? { skills: skills.map((s: string) => s.trim()).filter(Boolean) } : {}),
        ...(github !== undefined ? { github: typeof github === "string" ? github.trim() : null } : {}),
        ...(linkedin !== undefined ? { linkedin: typeof linkedin === "string" ? linkedin.trim() : null } : {}),
      },
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
        connected: true,
        online: true,
      },
    });

    // If name changed, update the JWT token with the new name
    const response = NextResponse.json({
      success: true,
      message: "Profile updated successfully!",
      user: updatedUser,
    });

    if (name && name.trim() !== currentUser.name) {
      const newToken = await createSessionToken({
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
      });

      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
