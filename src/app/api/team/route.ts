import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TeamMember from "@/models/TeamMember";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

export async function GET() {
  try {
    await connectDB();
    const members = await TeamMember.find().sort({ order: 1, createdAt: 1 });
    return NextResponse.json(members);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;

    const formData = await req.formData();
    const file = formData.get("photo") as File | null;

    const fields: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "photo") fields[key] = value;
    }

    let photoData: { public_id?: string; url: string } | undefined;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, { folder: "iiitians/team" });
      photoData = { public_id: result.public_id, url: result.secure_url };
    }

    const member = await TeamMember.create({ ...fields, ...(photoData ? { photo: photoData } : {}) });
    return NextResponse.json(member, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
