import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentUserFromCookie();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin authority required." }, { status: 403 });
    }

    const events = await prisma.techEvent.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                track: true,
              },
            },
          },
        },
      },
    });

    const formatted = events.map((e) => ({
      id: e.id,
      title: e.title,
      month: e.month,
      day: e.day,
      location: e.location,
      time: e.time,
      description: e.description,
      rsvpsCount: e.rsvps.length,
      attendees: e.rsvps.map((r) => r.user),
      createdAt: e.createdAt.toISOString(),
    }));

    return NextResponse.json({ events: formatted });
  } catch (error) {
    console.error("Admin fetch events error:", error);
    return NextResponse.json({ error: "Failed to fetch events." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUserFromCookie();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin authority required." }, { status: 403 });
    }

    const body = await req.json();
    const { title, month, day, location, time, description } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Event title is required." }, { status: 400 });
    }
    if (!month || !month.trim()) {
      return NextResponse.json({ error: "Month is required (e.g. MAY, JUN)." }, { status: 400 });
    }
    if (!day || !day.trim()) {
      return NextResponse.json({ error: "Day is required (e.g. 28)." }, { status: 400 });
    }

    const newEvent = await prisma.techEvent.create({
      data: {
        title: title.trim(),
        month: month.trim().toUpperCase(),
        day: day.trim(),
        location: (location && location.trim()) || "Campus Main Hall",
        time: (time && time.trim()) || "TBA",
        description: (description && description.trim()) || "Senior class upcoming event.",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Event "${newEvent.title}" posted successfully! 📅`,
      event: {
        id: newEvent.id,
        title: newEvent.title,
        month: newEvent.month,
        day: newEvent.day,
        location: newEvent.location,
        time: newEvent.time,
        description: newEvent.description,
        rsvpsCount: 0,
        attendees: [],
        createdAt: newEvent.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Admin create event error:", error);
    return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
  }
}
