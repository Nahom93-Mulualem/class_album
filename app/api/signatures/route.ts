import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    const signatures = await prisma.yearbookSignature.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = signatures.map((s) => ({
      id: s.id,
      authorName: s.authorName,
      authorAvatar: s.authorAvatar,
      authorTrack: s.authorTrack,
      date: s.date,
      message: s.message,
    }));

    return NextResponse.json({ signatures: formatted });
  } catch (error) {
    console.error("Fetch signatures error:", error);
    return NextResponse.json({ error: "Failed to fetch signatures." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    if (!currentUser.isActive) {
      return NextResponse.json(
        { error: "Deactivated accounts cannot sign the yearbook." },
        { status: 403 }
      );
    }

    const { message } = await req.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Signature message cannot be empty." }, { status: 400 });
    }

    const nowFormatted = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date());

    const signature = await prisma.yearbookSignature.create({
      data: {
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        authorTrack: currentUser.track,
        message: message.trim(),
        date: nowFormatted,
      },
    });

    return NextResponse.json({
      success: true,
      signature: {
        id: signature.id,
        authorName: signature.authorName,
        authorAvatar: signature.authorAvatar,
        authorTrack: signature.authorTrack,
        date: signature.date,
        message: signature.message,
      },
    });
  } catch (error) {
    console.error("Create signature error:", error);
    return NextResponse.json({ error: "Failed to add signature." }, { status: 500 });
  }
}
