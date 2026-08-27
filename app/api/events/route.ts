import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUserFromCookie();

    const events = await prisma.techEvent.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        rsvps: true,
      },
    });

    const formatted = events.map((e) => {
      const isRSVPed = currentUser
        ? e.rsvps.some((r) => r.userId === currentUser.id)
        : false;

      return {
        id: e.id,
        title: e.title,
        month: e.month,
        day: e.day,
        location: e.location,
        time: e.time,
        description: e.description,
        isRSVPed,
      };
    });

    return NextResponse.json({ events: formatted });
  } catch (error) {
    console.error("Fetch events error:", error);
    return NextResponse.json({ error: "Failed to fetch events." }, { status: 500 });
  }
}
