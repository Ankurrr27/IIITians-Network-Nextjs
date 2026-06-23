import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Opportunity from "@/models/Opportunity";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

// GET /api/admin/opportunities — List all opportunities for moderation
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Security Gate
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;

    const listings = await Opportunity.find().sort({ createdAt: -1 });
    return NextResponse.json(listings);
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
