import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Alumni from "@/models/Alumni";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

// PATCH /api/alumni/[id]/status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const { status } = await req.json();
    if (!["approved", "rejected", "pending"].includes(status))
      return NextResponse.json({ message: "Status must be pending, approved, or rejected" }, { status: 400 });
    const alumni = await Alumni.findByIdAndUpdate(id, { status, reviewedAt: status === "pending" ? null : new Date() }, { new: true, runValidators: true });
    if (!alumni) return NextResponse.json({ message: "Alumni request not found" }, { status: 404 });
    return NextResponse.json(alumni);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
