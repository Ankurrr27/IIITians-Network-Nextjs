import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import DiscussAccount from "@/models/DiscussAccount";

// GET /api/discuss-accounts/public — public list of authorized accounts
export async function GET() {
  try {
    await connectDB();
    const accounts = await DiscussAccount.find({ isAuthorized: true }).select("collegeName clubName badgeLabel website role isAuthorized").sort({ colleges: 1, clubName: 1 });
    return NextResponse.json(accounts);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
