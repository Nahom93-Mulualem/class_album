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

    const { id: eventId } = await params;

    const event = await prisma.techEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const existingRSVP = await prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: currentUser.id,
        },
      },
    });

    let isRSVPed = false;

    if (existingRSVP) {
      await prisma.eventRSVP.delete({
        where: { id: existingRSVP.id },
      });
      isRSVPed = false;
    } else {
      await prisma.eventRSVP.create({
        data: {
          eventId,
          userId: currentUser.id,
        },
      });
      isRSVPed = true;
    }

    return NextResponse.json({
      success: true,
      isRSVPed,
      message: isRSVPed
        ? `RSVP confirmed for ${event.title}! 🎟️`
        : `Removed RSVP for ${event.title}.`,
    });
  } catch (error) {
    console.error("Toggle RSVP error:", error);
    return NextResponse.json({ error: "Failed to toggle RSVP." }, { status: 500 });
  }
}
