import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TeamRequest from "@/models/TeamRequest";
import TeamMember from "@/models/TeamMember";
import Term from "@/models/Term";
import Committee from "@/models/Committee";
import Role from "@/models/Role";
import TermTenure from "@/models/TermTenure";
import { isNextResponse, requireAdmin } from "@/lib/requireAdmin";
import { syncTeamMemberLegacyProfile } from "@/lib/teamLegacySync";

function inferRoleType(role: string): "EXEC" | "LEAD" | "MEMBER" {
  const normalized = role.toLowerCase();
  if (/president|secretary|treasurer|director/.test(normalized)) return "EXEC";
  if (/lead|head|manager|coordinator/.test(normalized)) return "LEAD";
  return "MEMBER";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = requireAdmin(req);
  if (isNextResponse(payload)) return payload;

  try {
    await connectDB();
    const { id } = await params;
    const { action, updates } = await req.json();
    const request = await TeamRequest.findById(id);
    if (!request) return NextResponse.json({ message: "Team request not found." }, { status: 404 });
    if (request.status !== "pending") return NextResponse.json({ message: "This request has already been reviewed." }, { status: 409 });

    if (action === "reject") {
      request.status = "rejected";
      request.reviewedAt = new Date();
      await request.save();
      return NextResponse.json({ ok: true, status: request.status });
    }
    if (action !== "accept") {
      return NextResponse.json({ message: "Choose accept or reject." }, { status: 400 });
    }

    if (updates && typeof updates === "object") {
      const editableFields = ["name", "email", "iiit", "team", "role", "year", "linkedin", "instagram", "twitter", "aboutText", "messageText"] as const;
      for (const field of editableFields) {
        if (typeof updates[field] === "string") request[field] = updates[field].trim();
      }
    }

    const normalizeTerm = (name: string) => name.trim().toLowerCase().replace(/[\s–—]/g, "").replace(/\//g, "-");
    const terms = await Term.find();
    const term = terms.find((candidate) => normalizeTerm(candidate.name) === normalizeTerm(request.year));
    if (!term) {
      await request.save();
      const availableTerms = terms.map((candidate) => candidate.name).join(", ");
      return NextResponse.json({ message: `Could not match term "${request.year}". Available terms: ${availableTerms || "none"}.` }, { status: 400 });
    }

    const committee = await Committee.findOneAndUpdate(
      { name: request.team },
      { $setOnInsert: { name: request.team, order: 0 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const fallbackRoleType = inferRoleType(request.role);
    const role = await Role.findOneAndUpdate(
      { name: request.role },
      {
        $setOnInsert: {
          name: request.role,
          roleType: fallbackRoleType,
          level: fallbackRoleType === "EXEC" ? 100 : fallbackRoleType === "LEAD" ? 50 : 10,
          permissions: [],
          isCustom: false,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    let member = request.memberId ? await TeamMember.findById(request.memberId) : null;
    if (!member) member = await TeamMember.findOne({ email: request.email });
    const memberFields = {
      name: request.name,
      email: request.email,
      iiit: request.iiit,
      role: role.name,
      roleType: role.roleType,
      team: committee.name,
      year: term.name,
      linkedin: request.linkedin || "",
      instagram: request.instagram || "",
      twitter: request.twitter || "",
      aboutText: request.aboutText || "",
      messageText: request.messageText || "",
      isActive: true,
      ...(request.photo ? { photo: request.photo } : {}),
    };

    if (!member) {
      member = await TeamMember.create(memberFields);
    } else {
      Object.assign(member, memberFields);
      await member.save();
    }

    const tenure = await TermTenure.findOneAndUpdate(
      { memberId: member._id, termId: term._id, status: "ACTIVE" },
      { $set: { committeeId: committee._id, roleId: role._id }, $setOnInsert: { memberId: member._id, termId: term._id, status: "ACTIVE" } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    await syncTeamMemberLegacyProfile(member);

    request.memberId = member._id;
    request.status = "approved";
    request.reviewedAt = new Date();
    await request.save();

    return NextResponse.json({ ok: true, member, tenure, status: request.status });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Could not process team request." }, { status: 400 });
  }
}
