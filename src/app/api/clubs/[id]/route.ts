import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Club from "@/models/Club";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const body = await req.json();
    const club = await Club.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!club) return NextResponse.json({ message: "Club not found" }, { status: 404 });
    return NextResponse.json(club);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const club = await Club.findByIdAndDelete(id);
    if (!club) return NextResponse.json({ message: "Club not found" }, { status: 404 });
    return NextResponse.json({ message: "Club deleted" });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
