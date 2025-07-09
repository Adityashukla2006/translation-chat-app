import { writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher"; // make sure this points to your Prisma client

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File;
    const senderId = formData.get("senderId") as string;
    const recipientId = formData.get("receiverId") as string;
    const chatRoomId = formData.get("chatRoomId") as string;
    const content = formData.get("content") as string;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No audio file uploaded" }, { status: 400 });
    }

    const fileExtension = file.name.split(".").pop() || "webm";
    const fileName = `${uuidv4()}.${fileExtension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(process.cwd(), "public", "uploads", fileName);
    await writeFile(filePath, buffer);

    const audioUrl = `/uploads/${fileName}`;

    // ✅ Save to database
    const savedMessage = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        content,
        audioUrl,
        type: "voice",
        chatRoomId
      }
    });
    
    await pusherServer.trigger(`chat-${chatRoomId}`, "new-message", savedMessage);

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
