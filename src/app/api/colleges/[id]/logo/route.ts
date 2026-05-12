import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import College from "@/models/College";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

// GET /api/colleges/[id]/logo — redirect to logo URL
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const college = await College.findById(id);
    if (!college) return NextResponse.json({ message: "College not found" }, { status: 404 });
    if (!college.logo?.url) return NextResponse.json({ message: "Logo not available" }, { status: 404 });
    return NextResponse.redirect(college.logo.url);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

// PATCH /api/colleges/[id]/logo
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;

    const formData = await req.formData();
    const file = formData.get("logo") as File | null;
    if (!file) return NextResponse.json({ message: "Logo file is required" }, { status: 400 });

    const college = await College.findById(id);
    if (!college) return NextResponse.json({ message: "College not found" }, { status: 404 });

    if (college.logo?.public_id) await deleteFromCloudinary(college.logo.public_id);

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, { folder: "iiitians/colleges/logos" });
    college.logo = { public_id: result.public_id, url: result.secure_url };
    await college.save();

    return NextResponse.json({ message: "College logo updated successfully", logo: college.logo });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
