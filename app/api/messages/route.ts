import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { jwtVerify, signJwt } from "@/lib/jwt";
import { Session } from "inspector/promises";
import { verify } from "crypto";

interface SessionUser {
  id: string;
  name: string;
}


export async function POST(req: NextRequest, {params} : {params : {Id : string}}) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = jwtVerify(token);
  const { chatId, recipientId, content, audioUrl, type } = await req.json();
  const senderId = params.Id;
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
