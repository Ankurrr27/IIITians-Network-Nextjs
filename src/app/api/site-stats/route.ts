import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import SiteStats from "@/models/SiteStats";

export async function GET() {
  try {
    await connectDB();
    const stats = await SiteStats.findOne();
    return NextResponse.json(stats || {});
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
