import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  const { name, password } = await req.json();

  if (!name || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { name } });
  console.log(user?.password);
  console.log(password);
  if (!user || !user.password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
  const res = NextResponse.json({ ok: true });

  // Set token as HttpOnly cookie
  res.cookies.set("token", token, {
    httpOnly: false,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return res;
}
