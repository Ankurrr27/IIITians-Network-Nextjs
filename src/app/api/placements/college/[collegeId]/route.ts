import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Placement from "@/models/Placement";

export async function GET(_: NextRequest, { params }: { params: Promise<{ collegeId: string }> }) {
  try {
    await connectDB();
    const { collegeId } = await params;
    const placement = await Placement.findOne({ college: collegeId }).populate("college");
    if (!placement) return NextResponse.json({ message: "Placement not found" }, { status: 404 });
    return NextResponse.json(placement);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
