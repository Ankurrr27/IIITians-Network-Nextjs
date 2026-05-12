import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Placement from "@/models/Placement";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

export async function GET() {
  try {
    await connectDB();
    const placements = await Placement.find().populate("college");
    return NextResponse.json(placements);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { college } = await req.json();
    const placement = await Placement.create({ college });
    return NextResponse.json(placement, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
