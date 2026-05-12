import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Placement from "@/models/Placement";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

// PATCH /api/placements/[id]/year — add/update placement year data
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const body = await req.json();
    const { year, placements } = body;

    const doc = await Placement.findById(id);
    if (!doc) return NextResponse.json({ message: "Placement not found" }, { status: 404 });

    const existing = doc.yearlyPlacements.find((y) => y.year === year);
    if (existing) {
      existing.placements = placements;
    } else {
      doc.yearlyPlacements.push({ year, placements });
    }
    await doc.save();
    return NextResponse.json(doc);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
