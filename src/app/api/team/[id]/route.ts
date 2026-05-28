import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TeamMember from "@/models/TeamMember";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;

    let fields: Record<string, unknown> = {};
    let photoData: { public_id?: string; url: string } | undefined;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (key !== "photo") fields[key] = value;
      }
      const file = formData.get("photo") as File | null;
      if (file) {
        const member = await TeamMember.findById(id);
        if (member?.photo?.public_id) await deleteFromCloudinary(member.photo.public_id);
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadToCloudinary(buffer, { folder: "iiitians/team" });
        photoData = { public_id: result.public_id, url: result.secure_url };
      }
    } else {
      fields = await req.json();
    }

    const updates = { ...fields, ...(photoData ? { photo: photoData } : {}) };
    const member = await TeamMember.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!member) return NextResponse.json({ message: "Team member not found" }, { status: 404 });
    return NextResponse.json(member);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const member = await TeamMember.findById(id);
    if (!member) return NextResponse.json({ message: "Team member not found" }, { status: 404 });
    if (member.photo?.public_id) {
      await deleteFromCloudinary(member.photo.public_id);
    }
    await member.deleteOne();
    return NextResponse.json({ message: "Team member deleted successfully" });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}

export const PUT = PATCH;

