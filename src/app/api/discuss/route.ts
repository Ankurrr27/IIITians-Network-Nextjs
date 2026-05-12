import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Discuss from "@/models/Discuss";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = req.nextUrl;
    const status = url.searchParams.get("status");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = status ? { status } : { status: "approved" };
    const posts = await Discuss.find(query).populate("account").sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const post = await Discuss.create({ ...body, status: "pending" });
    return NextResponse.json(post, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
