import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import College from "@/models/College";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

function normalizeClubLinks(input: unknown) {
  let arr = input;
  if (typeof arr === "string") { try { arr = JSON.parse(arr); } catch { arr = []; } }
  if (arr && typeof arr === "object" && !Array.isArray(arr)) arr = Object.values(arr as object);
  if (!Array.isArray(arr)) return [];
  return (arr as { name?: string; url?: string }[])
    .map((item) => ({ name: (item?.name || "").trim(), url: (item?.url || "").trim() }))
    .filter((item) => item.name && item.url);
}

// GET /api/colleges/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const college = await College.findById(id);
    if (!college) return NextResponse.json({ message: "College not found" }, { status: 404 });
    return NextResponse.json(college);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

// PATCH /api/colleges/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const body = await req.json();
    const updates: Record<string, unknown> = {};
    for (const field of ["name", "description", "website", "clubLink"]) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    if (body.clubLinks !== undefined) updates.clubLinks = normalizeClubLinks(body.clubLinks);
    const college = await College.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!college) return NextResponse.json({ message: "College not found" }, { status: 404 });
    return NextResponse.json(college);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
