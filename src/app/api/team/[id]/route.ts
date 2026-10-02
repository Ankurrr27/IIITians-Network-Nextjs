import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TeamMember from "@/models/TeamMember";
import TermTenure from "@/models/TermTenure";
import Term from "@/models/Term";
import Committee from "@/models/Committee";
import Role from "@/models/Role";
import Alumni from "@/models/Alumni";
import TeamRequest from "@/models/TeamRequest";
import PromotionLog from "@/models/PromotionLog";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";
import { syncTeamMemberLegacyProfile } from "@/lib/teamLegacySync";

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

    const activeTenures = await TermTenure.find({ memberId: member._id, status: "ACTIVE" });
    if (activeTenures.length > 0) {
      const tenureUpdates: Record<string, unknown> = {};
      if (typeof fields.role === "string" && fields.role.trim()) {
        const roleType = typeof fields.roleType === "string" ? fields.roleType : member.roleType || "MEMBER";
        const role = await Role.findOneAndUpdate(
          { name: fields.role.trim() },
          { $set: { roleType }, $setOnInsert: { level: roleType === "EXEC" ? 100 : roleType === "LEAD" ? 50 : 10 } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        tenureUpdates.roleId = role._id;
      }
      if (typeof fields.team === "string" && fields.team.trim()) {
        const committee = await Committee.findOneAndUpdate(
          { name: fields.team.trim() },
          { $setOnInsert: { name: fields.team.trim() } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        tenureUpdates.committeeId = committee._id;
      }
      if (typeof fields.year === "string" && fields.year.trim()) {
        const now = new Date();
        const term = await Term.findOneAndUpdate(
          { name: fields.year.trim() },
          { $setOnInsert: { startDate: now, endDate: now, isActive: false } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        tenureUpdates.termId = term._id;
      }
      if (Object.keys(tenureUpdates).length > 0) {
        await TermTenure.updateMany({ memberId: member._id, status: "ACTIVE" }, { $set: tenureUpdates });
      }
    }
    await syncTeamMemberLegacyProfile(member);
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

    const linkedAlumni = await Alumni.find({ sourceTeamMemberId: member._id });
    const preservesPhoto = linkedAlumni.some((profile) => profile.legacyType === "alumni" && profile.photo?.public_id === member.photo?.public_id);
    if (member.photo?.public_id && !preservesPhoto) {
      await deleteFromCloudinary(member.photo.public_id);
    }

    await Promise.all([
      TermTenure.deleteMany({ memberId: member._id }),
      PromotionLog.deleteMany({ memberId: member._id }),
      TeamRequest.deleteMany({ $or: [{ memberId: member._id }, { email: member.email }] }),
      Alumni.deleteMany({
        legacyType: "team_member",
        $or: [{ sourceTeamMemberId: member._id }, { email: member.email }],
      }),
      Alumni.updateMany(
        { legacyType: "alumni", sourceTeamMemberId: member._id },
        { $unset: { sourceTeamMemberId: "" } }
      ),
    ]);
    await member.deleteOne();
    return NextResponse.json({ message: "Team member and linked team records permanently deleted" });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}

export const PUT = PATCH;

