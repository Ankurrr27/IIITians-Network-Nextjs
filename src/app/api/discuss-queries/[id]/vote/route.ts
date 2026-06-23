import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import DiscussQuery from "@/models/DiscussQuery";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { action } = await req.json();

    const increment = action === "down" ? -1 : 1;

    const query = await DiscussQuery.findByIdAndUpdate(
      id,
      { $inc: { upvotes: increment } },
      { new: true }
    );

    if (!query) {
      return NextResponse.json({ message: "Query not found" }, { status: 404 });
    }

    return NextResponse.json({ upvotes: query.upvotes || 0 });
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 400 }
    );
  }
}
