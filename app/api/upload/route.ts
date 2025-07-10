import { uploadToS3 } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";
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
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `audio/${uuidv4()}.wav`; // Use .mp3 or .webm as needed

    const s3Url = await uploadToS3(buffer, fileName, file.type || "audio/mpeg");

    const savedMessage = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        content,
        audioUrl: s3Url,  // S3 URL instead of base64
        type: "voice",
        chatRoomId,
      },
    });

    // You may truncate the message payload if Pusher still complains
    await pusherServer.trigger(`chat-${chatRoomId}`, "new-message", {
      ...savedMessage,
      audioUrl: s3Url, // Or remove if too large
    });

    return NextResponse.json({ audioUrl: s3Url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
