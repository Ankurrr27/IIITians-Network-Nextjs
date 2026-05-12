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

// GET /api/colleges
export async function GET() {
  try {
    await connectDB();
    const colleges = await College.find();
    return NextResponse.json(colleges);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

// POST /api/colleges
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const body = await req.json();
    const college = await College.create({
      name: body.name,
      website: body.website,
      clubLink: body.clubLink,
      clubLinks: normalizeClubLinks(body.clubLinks),
      description: body.description,
    });
    return NextResponse.json(college, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
