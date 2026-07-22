import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import DiscussQuery from "@/models/DiscussQuery";
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

// GET /api/discuss-queries - Fetch all queries
export async function GET() {
  try {
    await connectDB();
    const queries = await DiscussQuery.find().sort({ upvotes: -1, createdAt: -1 });
    return NextResponse.json(queries);
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

// POST /api/discuss-queries - Create a query
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const accountId = getDiscussAccountId(req);
    if (!accountId) {
      return NextResponse.json({ message: "Login required to post a query" }, { status: 401 });
    }

    const account = await DiscussAccount.findById(accountId);
    if (!account) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 });
    }

    if (!account.isAuthorized) {
      return NextResponse.json(
        { message: "Your club account is pending admin verification. You cannot create discussions until it has been approved." },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.title?.trim() || !body.body?.trim()) {
      return NextResponse.json({ message: "Title and body are required" }, { status: 400 });
    }

    const query = await DiscussQuery.create({
      title: body.title.trim(),
      body: body.body.trim(),
      category: body.category || "Club Help",
      clubName: account.clubName,
      collegeName: account.collegeName,
      account: account._id,
    });

    return NextResponse.json(query, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
