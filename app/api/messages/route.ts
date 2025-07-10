import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { jwtVerify } from "@/lib/jwt";
  


export async function POST(
  req: NextRequest
) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = jwtVerify(token);
  const { chatId, recipientId, content, audioUrl, type, senderId } = await req.json();
  if (!chatId || !recipientId || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }


  const message = await prisma.message.create({
    data: {
      senderId: userId,
      recipientId:senderId,
      content,
      audioUrl,
      type,
      chatRoomId: chatId
    },
  });

  await pusherServer.trigger(`chat-${senderId}`, "new-message", message);

  return NextResponse.json({ ok: true, message });
}
