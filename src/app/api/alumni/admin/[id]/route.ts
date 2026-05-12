import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Alumni from "@/models/Alumni";
import TeamMember from "@/models/TeamMember";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

function normalizePayload(body: Record<string, unknown>) {
  return { ...body, name: (body.name as string)?.trim(), email: (body.email as string)?.trim().toLowerCase(), iiit: (body.iiit as string)?.trim(), generation: (body.generation as string)?.trim(), branch: (body.branch as string)?.trim(), networkPost: (body.networkPost as string)?.trim() || "", currentRole: (body.currentRole as string)?.trim() || "", currentCompany: (body.currentCompany as string)?.trim() || "", location: (body.location as string)?.trim() || "", linkedin: (body.linkedin as string)?.trim() || "", instagram: (body.instagram as string)?.trim() || "", bio: (body.bio as string)?.trim() || "", graduationYear: Number(body.graduationYear) };
}

// PATCH /api/alumni/admin/[id] — admin update alumni profile
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const authPayload = requireAdmin(req);
    if (isNextResponse(authPayload)) return authPayload;
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("photo") as File | null;
    const rawBody: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) { if (key !== "photo") rawBody[key] = value; }
    const payload = normalizePayload(rawBody);
    const required = ["name", "email", "iiit", "generation", "branch", "graduationYear"];
    const missing = required.find((f) => !payload[f as keyof typeof payload]);
    if (missing) return NextResponse.json({ message: `${missing} is required` }, { status: 400 });
    const alumni = await Alumni.findById(id);
    if (!alumni) return NextResponse.json({ message: "Legacy profile not found" }, { status: 404 });
    let photo = alumni.photo;
    if (file) {
      if (alumni.photo?.public_id) await deleteFromCloudinary(alumni.photo.public_id);
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, { folder: "iiitians/alumni" });
      photo = { public_id: result.public_id, url: result.secure_url };
    }
    const updated = await Alumni.findByIdAndUpdate(id, { ...payload, photo, status: alumni.status || "approved", reviewedAt: alumni.reviewedAt }, { new: true, runValidators: true });
    return NextResponse.json({ message: "Legacy profile updated successfully.", alumni: updated });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}

// DELETE /api/alumni/admin/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const authPayload = requireAdmin(req);
    if (isNextResponse(authPayload)) return authPayload;
    const { id } = await params;
    const alumni = await Alumni.findByIdAndDelete(id);
    if (!alumni) return NextResponse.json({ message: "Alumni entry not found" }, { status: 404 });
    return NextResponse.json({ message: "Alumni entry deleted successfully" });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
