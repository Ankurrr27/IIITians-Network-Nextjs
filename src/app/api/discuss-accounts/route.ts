import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import DiscussAccount from "@/models/DiscussAccount";
import bcrypt from "bcryptjs";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const accounts = await DiscussAccount.find().select("-password").sort({ createdAt: -1 });
    return NextResponse.json(accounts);
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
    const { email, password, ...rest } = body;
    if (!email || !password) return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    const hashed = await bcrypt.hash(password, 10);
    const account = await DiscussAccount.create({ ...rest, email: email.trim().toLowerCase(), password: hashed });
    return NextResponse.json({ ...account.toObject(), password: undefined }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) return NextResponse.json({ message: "Account already exists" }, { status: 409 });
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
