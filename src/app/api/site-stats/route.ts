import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import SiteStats from "@/models/SiteStats";

export async function GET() {
  try {
    await connectDB();
    let stats = await SiteStats.findOne();
    if (!stats) {
      stats = await SiteStats.create({
        totalViews: 0,
        totalVisits: 0,
        instagramFollowers: 12400,
        linkedinFollowers: 18500,
        overallReach: 750000,
      });
    } else {
      let updated = false;
      if (stats.instagramFollowers === undefined) {
        stats.instagramFollowers = 12400;
        updated = true;
      }
      if (stats.linkedinFollowers === undefined) {
        stats.linkedinFollowers = 18500;
        updated = true;
      }
      if (stats.overallReach === undefined) {
        stats.overallReach = 750000;
        updated = true;
      }
      if (updated) {
        await stats.save();
      }
    }
    return NextResponse.json(stats);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
