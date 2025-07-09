import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust this path based on your project

export async function GET() {
  try {
    const users = await prisma.user.findMany(); // Adjust model name if different
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

