import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentUserFromCookie();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin authority required." }, { status: 403 });
    }

    const { id: eventId } = await params;
    const body = await req.json();
    const { title, month, day, location, time, description } = body;

    const existing = await prisma.techEvent.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const updated = await prisma.techEvent.update({
      where: { id: eventId },
      data: {
        ...(title && typeof title === "string" ? { title: title.trim() } : {}),
        ...(month && typeof month === "string" ? { month: month.trim().toUpperCase() } : {}),
        ...(day && typeof day === "string" ? { day: day.trim() } : {}),
        ...(location !== undefined ? { location: typeof location === "string" ? location.trim() : "Campus Main Hall" } : {}),
        ...(time !== undefined ? { time: typeof time === "string" ? time.trim() : "TBA" } : {}),
        ...(description !== undefined ? { description: typeof description === "string" ? description.trim() : "" } : {}),
      },
      include: {
        rsvps: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Event "${updated.title}" updated successfully! ✏️`,
      event: {
        id: updated.id,
        title: updated.title,
        month: updated.month,
        day: updated.day,
        location: updated.location,
        time: updated.time,
        description: updated.description,
        rsvpsCount: updated.rsvps.length,
      },
    });
  } catch (error) {
    console.error("Admin update event error:", error);
    return NextResponse.json({ error: "Failed to update event." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentUserFromCookie();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin authority required." }, { status: 403 });
    }

    const { id: eventId } = await params;

    const existing = await prisma.techEvent.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    await prisma.techEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({
      success: true,
      message: `Event "${existing.title}" deleted successfully.`,
    });
  } catch (error) {
    console.error("Admin delete event error:", error);
    return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
  }
}
