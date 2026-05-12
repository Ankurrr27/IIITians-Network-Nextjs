import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import College from "@/models/College";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

// PATCH /api/colleges/[id]/photo
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;

    const formData = await req.formData();
    const file = formData.get("photo") as File | null;
    if (!file) return NextResponse.json({ message: "Photo file is required" }, { status: 400 });

    const college = await College.findById(id);
    if (!college) return NextResponse.json({ message: "College not found" }, { status: 404 });

    if (college.photo?.public_id) await deleteFromCloudinary(college.photo.public_id);

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, { folder: "iiitians/colleges/photos" });

    college.photo = { public_id: result.public_id, url: result.secure_url };
    await college.save();

    return NextResponse.json({ message: "College photo updated successfully", photo: college.photo });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
