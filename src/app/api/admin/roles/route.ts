import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Role from "@/models/Role";

export async function GET() {
  try {
    await connectDB();
    const roles = await Role.find().sort({ level: -1 }).lean();
    return NextResponse.json(roles);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
