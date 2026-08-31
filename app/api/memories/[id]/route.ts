import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Memory ID is required." }, { status: 400 });
    }

    const memory = await prisma.memory.findUnique({
      where: { id },
    });

    if (!memory) {
      return NextResponse.json({ error: "Memory not found." }, { status: 404 });
    }

    // Only the author or an ADMIN can delete the memory
    if (currentUser.role !== "ADMIN" && memory.authorId !== currentUser.id) {
      return NextResponse.json(
        { error: "Forbidden. You can only delete your own memories unless you are an Admin." },
        { status: 403 }
      );
    }

    await prisma.memory.delete({
      where: { id },
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
