import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TeamMember from "@/models/TeamMember";
import TermTenure from "@/models/TermTenure";
import Term from "@/models/Term";
import Committee from "@/models/Committee";
import Role from "@/models/Role";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";
import { handleServerError, handleClientError } from "@/lib/errorHelper";

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all active tenures populated with their relations
    const tenures = await TermTenure.find({ status: "ACTIVE" })
      .populate("memberId")
      .populate("termId")
      .populate("committeeId")
      .populate("roleId")
      .lean();

    // Map to legacy flat format for frontend compatibility
    const formattedMembers = tenures.map((t: any) => {
      const member = t.memberId;
      return {
        _id: t._id, // Using tenure ID as primary key for updates
        memberId: member._id,
        name: member.name,
        role: t.roleId?.name || "Member",
        roleType: t.roleId?.roleType || "MEMBER",
        iiit: member.iiit,
        photo: member.photo,
        email: member.email,
        linkedin: member.linkedin,
        instagram: member.instagram,
        twitter: member.twitter,
        currentCompany: member.currentCompany,
        location: member.location,
        aboutText: member.aboutText,
        messageText: member.messageText,
        team: t.committeeId?.name || "Core",
        year: t.termId?.name || "2025-26",
        isActive: t.status === "ACTIVE",
        order: t.committeeId?.order || 0,
        createdAt: t.createdAt,
      };
    }).sort((a, b) => a.order - b.order || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Also include TeamMember profiles that do not have an ACTIVE tenure yet
    const allMembers = await TeamMember.find().lean();
    const presentMemberIds = new Set(formattedMembers.map((f: any) => String(f.memberId)));
    for (const mem of allMembers) {
      if (!presentMemberIds.has(String(mem._id))) {
        formattedMembers.push({
          _id: mem._id,
          memberId: mem._id,
          name: mem.name,
          role: (mem as any).role || "Member",
          roleType: (mem as any).roleType || "MEMBER",
          iiit: mem.iiit || "",
          photo: mem.photo,
          email: mem.email,
          linkedin: mem.linkedin,
          instagram: mem.instagram,
          twitter: mem.twitter,
          currentCompany: mem.currentCompany,
          location: mem.location,
          aboutText: mem.aboutText,
          messageText: mem.messageText,
          team: (mem as any).team || "Core",
          year: (mem as any).year || "",
          isActive: (mem as any).isActive ?? false,
          order: (mem as any).order ?? 9999,
          createdAt: mem.createdAt,
        });
      }
    }

    formattedMembers.sort((a: any, b: any) => a.order - b.order || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return NextResponse.json(formattedMembers);
  } catch (err) {
    return handleServerError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;

    const formData = await req.formData();
    const file = formData.get("photo") as File | null;
    
    const fields: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "photo") fields[key] = value;
    }

    let photoData: { public_id?: string; url: string } | undefined;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, { folder: "iiitians/team" });
      photoData = { public_id: result.public_id, url: result.secure_url };
    }

    // 1. Find or create the TeamMember profile
    let member = await TeamMember.findOne({ email: fields.email?.toLowerCase().trim() });
    if (!member) {
      if (!photoData) throw new Error("Photo is required for new members.");
      member = await TeamMember.create({
        name: fields.name,
        iiit: fields.iiit,
        email: fields.email,
        linkedin: fields.linkedin,
        instagram: fields.instagram,
        twitter: fields.twitter,
        currentCompany: fields.currentCompany,
        location: fields.location,
        aboutText: fields.aboutText,
        messageText: fields.messageText,
        photo: photoData,
      });
    }

    // 2. Resolve Term
    let term = await Term.findOne({ name: fields.year || "2025-26" });
    if (!term) term = await Term.create({ name: fields.year || "2025-26", startDate: new Date(), endDate: new Date() });

    // 3. Resolve Committee
    let committee = await Committee.findOne({ name: fields.team || "Core" });
    if (!committee) committee = await Committee.create({ name: fields.team || "Core" });

    // 4. Resolve Role
    let role = await Role.findOne({ name: fields.role || "Member" });
    if (!role) role = await Role.create({ name: fields.role || "Member", level: 10, roleType: fields.roleType || "MEMBER" });

    // 5. Create Tenure
    const tenure = await TermTenure.create({
      memberId: member._id,
      termId: term._id,
      committeeId: committee._id,
      roleId: role._id,
      status: "ACTIVE",
    });

    return NextResponse.json(tenure, { status: 201 });
  } catch (err) {
    return handleClientError(err);
  }
}
