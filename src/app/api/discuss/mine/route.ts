import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Discuss from "@/models/Discuss";
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

// GET /api/discuss/mine — get posts belonging to the logged-in club account
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const accountId = getDiscussAccountId(req);
    if (!accountId) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const posts = await Discuss.find({ account: accountId }).sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

// POST /api/discuss/mine — create a post (alternative to the main POST which uses admin auth)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const accountId = getDiscussAccountId(req);
    if (!accountId) return NextResponse.json({ message: "No token provided" }, { status: 401 });

    const account = await DiscussAccount.findById(accountId);
    if (!account) return NextResponse.json({ message: "Discuss account not found" }, { status: 404 });

    const body = await req.json();
    const isPrivileged = ["club_manager", "publisher"].includes(account.role);
    const shouldAutoApprove = account.isAuthorized && isPrivileged;

    const post = await Discuss.create({
      title: body.title,
      description: body.description,
      type: body.type || "announcement",
      collegeName: account.collegeName,
      clubName: account.clubName,
      contactName: account.contactName,
      contactEmail: account.email,
      contactPhone: account.contactPhone,
      actionLink: body.actionLink,
      eventDate: body.eventDate || null,
      account: account._id,
      accountRole: account.role,
      isAuthorisedPost: account.isAuthorized,
      badgeLabel: account.badgeLabel,
      status: shouldAutoApprove ? "approved" : "pending",
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
