import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Opportunity from "@/models/Opportunity";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

// PATCH /api/admin/opportunities/[id] — Approve, reject, or update opportunity moderation fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Security Gate
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;

    const { id } = await params;
    const body = await req.json();
    const { status, recruiterVerified, companyVerified, featured } = body;

    const opportunity = await Opportunity.findById(id);
    if (!opportunity) {
      return NextResponse.json({ message: "Opportunity listing not found" }, { status: 404 });
    }

    if (status !== undefined) {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return NextResponse.json({ message: "Invalid moderation status" }, { status: 400 });
      }
      opportunity.status = status;
    }

    if (recruiterVerified !== undefined) {
      opportunity.recruiterVerified = !!recruiterVerified;
    }

    if (companyVerified !== undefined) {
      opportunity.companyVerified = !!companyVerified;
    }

    if (featured !== undefined) {
      opportunity.featured = !!featured;
    }

    await opportunity.save();
    return NextResponse.json(opportunity);
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/opportunities/[id] — Delete opportunity permanently
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Security Gate
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;

    const { id } = await params;
    const opportunity = await Opportunity.findByIdAndDelete(id);
    if (!opportunity) {
      return NextResponse.json({ message: "Opportunity listing not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Opportunity listing permanently deleted" });
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
