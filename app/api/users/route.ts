import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { id, email, name } = await req.json();

    // Check if user already exists
    const existing = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    }

    await db.insert(usersTable).values({
      id,
      email,
      name,
    });

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
} 