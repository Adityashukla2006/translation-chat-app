import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "@/lib/jwt"; // Your own jwtVerify helper function

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const userId = searchParams.get("userId");
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Token missing" }, { status: 401 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { name: userId },
      select: { preferred_language: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ preferred_language: user.preferred_language || "en" });
  } catch (error) {
    console.error("Error in /api/user/language:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
