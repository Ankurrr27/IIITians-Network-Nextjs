import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import AppNotification from "@/models/AppNotification";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const body = await req.json();
    const notification = await AppNotification.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!notification) return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    return NextResponse.json(notification);
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
    const notification = await AppNotification.findByIdAndDelete(id);
    if (!notification) return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    return NextResponse.json({ message: "Notification deleted" });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
