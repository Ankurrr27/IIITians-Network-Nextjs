import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import AppNotification from "@/models/AppNotification";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

export async function GET() {
  try {
    await connectDB();
    const notifications = await AppNotification.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(notifications);
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
    const notification = await AppNotification.create(body);
    return NextResponse.json(notification, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
