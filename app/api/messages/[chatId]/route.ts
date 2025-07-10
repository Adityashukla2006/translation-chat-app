import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "@/lib/jwt";
import { pusherServer } from "@/lib/pusher";



function getChatRoomId(userId1: string, userId2: string): string { 
  return [userId1,userId2].sort().join("_");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = jwtVerify(token);
  const chatId = (await params).chatId;
  const recipientId = chatId.split('_').filter(id => id !== userId)[0];
  const chatRoomId = getChatRoomId(userId, recipientId);
   
  
  const messages = await prisma.message.findMany({
    where: 
      {chatRoomId}
    ,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ messages });
} 


export async function POST(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = jwtVerify(token);
  const { recipient, content, audioUrl, type } = await req.json();
  const chatId = (await params).chatId;
  if (!chatId || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }


  const message = await prisma.message.create({
    data: {
      chatRoomId: chatId,
      senderId: userId,
      recipientId:recipient,
      content,
      audioUrl,
      type,
    },
  });

  await pusherServer.trigger(`chat-${chatId}`, "new-message", message);

  return NextResponse.json({ ok: true, message });
}