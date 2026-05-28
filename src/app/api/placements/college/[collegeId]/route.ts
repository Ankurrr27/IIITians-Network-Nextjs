import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Placement from "@/models/Placement";
import College from "@/models/College";
import mongoose from "mongoose";

export async function GET(_: NextRequest, { params }: { params: Promise<{ collegeId: string }> }) {
  try {
    await connectDB();
    const { collegeId } = await params;
    const decodedParam = decodeURIComponent(collegeId);

    let placement;
    if (mongoose.Types.ObjectId.isValid(decodedParam)) {
      placement = await Placement.findOne({ college: decodedParam }).populate("college");
    } else {
      // Treat as college name query
      const college = await College.findOne({ name: new RegExp(`^${decodedParam}$`, "i") });
      if (!college) {
        return NextResponse.json({ message: "College not found" }, { status: 404 });
      }
      placement = await Placement.findOne({ college: college._id }).populate("college");
    }

    if (!placement) return NextResponse.json({ message: "Placement not found" }, { status: 404 });
    return NextResponse.json(placement);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
