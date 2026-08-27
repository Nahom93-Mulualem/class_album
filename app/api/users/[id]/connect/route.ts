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
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { id: studentId } = await params;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, connected: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Classmate not found." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: studentId },
      data: { connected: !student.connected },
      select: { id: true, name: true, connected: true },
    });

    return NextResponse.json({
      success: true,
      connected: updated.connected,
      message: updated.connected
        ? `Connected with ${updated.name}!`
        : `Disconnected from ${updated.name}.`,
    });
  } catch (error) {
    console.error("Connect error:", error);
    return NextResponse.json({ error: "Failed to update connection." }, { status: 500 });
  }
}
