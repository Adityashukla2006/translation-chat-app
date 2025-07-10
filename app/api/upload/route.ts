import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File;
    const senderId = formData.get("senderId") as string;
    const recipientId = formData.get("recipientId") as string;
    const chatRoomId = formData.get("chatRoomId") as string;
    const content = formData.get("content") as string;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No audio file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "audio/webm";
    const audioUrl = `data:${mimeType};base64,${base64Audio}`;

    const savedMessage = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        content,
        audioUrl,
        type: "voice",
        chatRoomId,
      },
    });

    await pusherServer.trigger(`chat-${chatRoomId}`, "new-message", savedMessage);

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
