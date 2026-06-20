import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Committee from "@/models/Committee";

export async function GET() {
  try {
    await connectDB();
    const committees = await Committee.find().sort({ order: 1 }).lean();
    return NextResponse.json(committees);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
