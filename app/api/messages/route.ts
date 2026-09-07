import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const partnerId = searchParams.get("partnerId");

    if (partnerId) {
      const partner = await prisma.user.findFirst({
        where: {
          OR: [
            { id: partnerId },
            { id: partnerId.startsWith("student-") ? partnerId : `student-${partnerId}` },
            { id: partnerId.replace(/^student-/, "") },
            { username: partnerId },
            { username: partnerId.replace(/^student-/, "") },
          ],
        },
        select: { id: true },
      });

      const actualPartnerId = partner ? partner.id : partnerId;
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: actualPartnerId },
            { senderId: actualPartnerId, receiverId: currentUser.id },
            { senderId: currentUser.id, receiverId: partnerId },
            { senderId: partnerId, receiverId: currentUser.id },
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json({
        messages: messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          receiverId: m.receiverId,
          text: m.text,
          isRead: m.isRead,
          time: new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          }).format(m.createdAt),
          reactions: m.reactions ? JSON.parse(m.reactions) : [],
          createdAt: m.createdAt.toISOString(),
        })),
      });
    }

    // Otherwise return all recent messages involving current user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }],
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        text: m.text,
        isRead: m.isRead,
        time: new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }).format(m.createdAt),
        reactions: m.reactions ? JSON.parse(m.reactions) : [],
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromCookie();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, text } = body;

    if (!receiverId || !text || !text.trim()) {
      return NextResponse.json(
        { error: "Receiver ID and message text are required." },
        { status: 400 }
      );
    }

    // Check if receiver exists with flexible matching
    const receiver = await prisma.user.findFirst({
      where: {
        OR: [
          { id: receiverId },
          { id: receiverId.startsWith("student-") ? receiverId : `student-${receiverId}` },
          { id: receiverId.replace(/^student-/, "") },
          { username: receiverId },
          { username: receiverId.replace(/^student-/, "") },
        ],
      },
      select: { id: true, name: true },
    });

    if (!receiver) {
      return NextResponse.json({ error: "Recipient user not found." }, { status: 404 });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId: currentUser.id,
        receiverId: receiver.id,
        text: text.trim(),
        isRead: false,
      },
    });

    const timeFormatted = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(newMessage.createdAt);

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        text: newMessage.text,
        isRead: newMessage.isRead,
        time: timeFormatted,
        reactions: [],
        createdAt: newMessage.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Create message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
