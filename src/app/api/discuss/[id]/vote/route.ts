import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Discuss from "@/models/Discuss";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { action } = await req.json();

    const increment = action === "down" ? -1 : 1;

    const post = await Discuss.findByIdAndUpdate(
      id,
      { $inc: { upvotes: increment } },
      { new: true }
    );

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ upvotes: post.upvotes || 0 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
