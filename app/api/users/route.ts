import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
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

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get directory users error:", error);
    return NextResponse.json({ error: "Failed to fetch directory users" }, { status: 500 });
  }
}
