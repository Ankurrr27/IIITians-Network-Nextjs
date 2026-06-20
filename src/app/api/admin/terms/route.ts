import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Term from "@/models/Term";

export async function GET() {
  try {
    await connectDB();
    const terms = await Term.find().sort({ startDate: -1 }).lean();
    return NextResponse.json(terms);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
