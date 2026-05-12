import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import DiscussAccount from "@/models/DiscussAccount";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const body = await req.json();
    const account = await DiscussAccount.findByIdAndUpdate(id, body, { new: true, runValidators: true }).select("-password");
    if (!account) return NextResponse.json({ message: "Account not found" }, { status: 404 });
    return NextResponse.json(account);
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
    const account = await DiscussAccount.findByIdAndDelete(id);
    if (!account) return NextResponse.json({ message: "Account not found" }, { status: 404 });
    return NextResponse.json({ message: "Account deleted" });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
