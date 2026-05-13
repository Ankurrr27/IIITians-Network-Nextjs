import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import DiscussAccount from "@/models/DiscussAccount";
import jwt from "jsonwebtoken";

function getDiscussAccountId(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const decoded = jwt.verify(auth.split(" ")[1], secret) as { id: string; kind: string };
    if (decoded.kind !== "discuss_account") return null;
    return decoded.id;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const accountId = getDiscussAccountId(req);
    if (!accountId) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const account = await DiscussAccount.findById(accountId).select("-password");
    if (!account) return NextResponse.json({ message: "Discuss account not found" }, { status: 404 });

    return NextResponse.json(account);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
