import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TeamMember from "@/models/TeamMember";
import TermTenure from "@/models/TermTenure";
import Alumni from "@/models/Alumni";
import { isNextResponse, requireAdmin } from "@/lib/requireAdmin";
import { syncTeamMemberLegacyProfile } from "@/lib/teamLegacySync";

export async function POST(req: NextRequest) {
  const payload = requireAdmin(req);
  if (isNextResponse(payload)) return payload;

  try {
    await connectDB();
    const membersWithTenure = await TermTenure.distinct("memberId");
    const members = await TeamMember.find({
      $or: [{ isActive: true }, { _id: { $in: membersWithTenure } }],
    }).lean();
    const linkedIds = new Set(
      (await Alumni.distinct("sourceTeamMemberId", { sourceTeamMemberId: { $ne: null } })).map(String)
    );
    const missingLinks = members.filter((member) => !linkedIds.has(String(member._id)));
    await Promise.all(missingLinks.map((member) => syncTeamMemberLegacyProfile(member)));

    return NextResponse.json({ synced: missingLinks.length, total: members.length });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Could not sync team profiles to Legacy." }, { status: 500 });
  }
}
