import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import SiteStats from "@/models/SiteStats";

export async function POST() {
  try {
    await connectDB();
    const stats = await SiteStats.findOneAndUpdate(
      {},
      { $inc: { totalViews: 1 } },
      { new: true, upsert: true }
    );
    return NextResponse.json({ totalViews: stats.totalViews });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
