import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie, verifyPassword } from "@/lib/auth";
import { createSessionToken, AUTH_COOKIE_NAME } from "@/lib/session";

const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    if (!currentUser.isActive) {
      return NextResponse.json(
        { error: "Your account is deactivated. Contact an administrator." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { newUsername, currentPassword } = body;

    if (!newUsername || !newUsername.trim()) {
      return NextResponse.json({ error: "New username is required." }, { status: 400 });
    }

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to verify your identity." },
        { status: 400 }
      );
    }

    const trimmedUsername = newUsername.trim().toLowerCase();

    if (trimmedUsername.length < 4 || trimmedUsername.length > 12) {
      return NextResponse.json(
        { error: "Username must be between 4 and 12 characters in length." },
        { status: 400 }
      );
    }

    if (!USERNAME_REGEX.test(trimmedUsername)) {
      return NextResponse.json(
        { error: "Username may only contain letters, numbers, dots (.), underscores (_), and hyphens (-)." },
        { status: 400 }
      );
    }

    if (trimmedUsername === currentUser.username.toLowerCase()) {
      return NextResponse.json(
        { error: "New username cannot be identical to your current username." },
        { status: 400 }
      );
    }

    // Verify current password
    const userRecord = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, password: true, name: true, avatar: true, role: true },
    });

    if (!userRecord) {
      return NextResponse.json({ error: "User record not found." }, { status: 404 });
    }

    const isPasswordValid = await verifyPassword(currentPassword, userRecord.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect current password. Verification failed." },
        { status: 400 }
      );
    }

    // Check username uniqueness
    const existing = await prisma.user.findFirst({
      where: {
        username: { equals: trimmedUsername, mode: "insensitive" },
        NOT: { id: currentUser.id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `The username '@${trimmedUsername}' is already taken. Please choose another.` },
        { status: 409 }
      );
    }

    // Update username in database
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: { username: trimmedUsername },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
      },
    });

    // Generate fresh session token with updated username
    const newToken = await createSessionToken({
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
    });

    const response = NextResponse.json({
      success: true,
      message: `Username updated successfully to @${updatedUser.username}!`,
      username: updatedUser.username,
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

    return response;
  } catch (error) {
    console.error("Change username error:", error);
    return NextResponse.json(
      { error: "Failed to update username. Please try again." },
      { status: 500 }
    );
  }
}
