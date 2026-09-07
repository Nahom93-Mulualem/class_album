import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie, verifyPassword, hashPassword } from "@/lib/auth";
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
    const { currentPassword, newUsername, newPassword, confirmPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to verify your credentials." },
        { status: 400 }
      );
    }

    if (!newUsername && !newPassword) {
      return NextResponse.json(
        { error: "Please provide either a new username, a new password, or both." },
        { status: 400 }
      );
    }

    // Verify current user & password
    const userRecord = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, password: true, name: true, avatar: true, role: true, username: true },
    });

    if (!userRecord) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    const isPasswordValid = await verifyPassword(currentPassword, userRecord.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect current password. Verification failed." },
        { status: 400 }
      );
    }

    const updateData: { username?: string; password?: string } = {};

    // Validate new username if provided
    if (newUsername && newUsername.trim()) {
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

      if (trimmedUsername !== userRecord.username.toLowerCase()) {
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

        updateData.username = trimmedUsername;
      }
    }

    // Validate new password if provided
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "New password and confirmation do not match." },
          { status: 400 }
        );
      }

      if (currentPassword === newPassword) {
        return NextResponse.json(
          { error: "New password cannot be identical to your current password." },
          { status: 400 }
        );
      }

      updateData.password = await hashPassword(newPassword);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No changes detected. Please specify a new username or new password." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
      },
    });

    // Refresh JWT session cookie
    const newToken = await createSessionToken({
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
    });

    const response = NextResponse.json({
      success: true,
      message: "Account credentials updated successfully!",
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
    console.error("Change credentials error:", error);
    return NextResponse.json(
      { error: "Failed to update account credentials." },
      { status: 500 }
    );
  }
}
