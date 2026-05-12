import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Club from "@/models/Club";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

export async function GET() {
  try {
    await connectDB();
    const clubs = await Club.find();
    return NextResponse.json(clubs);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const body = await req.json();
    const club = await Club.create(body);
    return NextResponse.json(club, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
