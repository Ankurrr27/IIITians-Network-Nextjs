import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TermTenure from "@/models/TermTenure";
import TeamMember from "@/models/TeamMember";
import PromotionLog from "@/models/PromotionLog";
import Role from "@/models/Role";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";
import { syncTeamMemberLegacyProfile } from "@/lib/teamLegacySync";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    
    // admin payload should ideally have admin user ID, assuming adminToken resolves it.
    const adminId = payload.id; 

    const { promotions } = await req.json();
    // promotions: [{ tenureId: string, newRoleId: string, reason?: string }]

    if (!Array.isArray(promotions) || promotions.length === 0) {
      return NextResponse.json({ message: "No promotions provided" }, { status: 400 });
    }

    const results = [];

    for (const promo of promotions) {
      const tenure = await TermTenure.findById(promo.tenureId)
        .populate("roleId")
        .populate("committeeId")
        .populate("termId");
      if (!tenure) continue;

      const oldRoleId = tenure.roleId._id;
      const newRole = await Role.findById(promo.newRoleId);
      if (!newRole) continue;

      // Update Tenure
      tenure.roleId = newRole._id;
      await tenure.save();

      const committee = tenure.committeeId as unknown as { name?: string };
      const term = tenure.termId as unknown as { name?: string };
      const updatedMember = await TeamMember.findByIdAndUpdate(tenure.memberId, {
        $set: {
          role: newRole.name,
          roleType: newRole.roleType,
          team: committee?.name || "Core",
          year: term?.name || "",
          isActive: true,
        },
      }, { new: true });
      if (updatedMember) await syncTeamMemberLegacyProfile(updatedMember);

      // Log Promotion
      const log = await PromotionLog.create({
        memberId: tenure.memberId,
        fromRoleId: oldRoleId,
        toRoleId: newRole._id,
        termId: tenure.termId,
        approvedBy: adminId, // Will be null if admin payload lacks userId
        reason: promo.reason || "Bulk promotion",
      });

      results.push(log);
    }

    return NextResponse.json({
      message: `Successfully processed ${results.length} promotions.`,
      promotions: results,
    });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
