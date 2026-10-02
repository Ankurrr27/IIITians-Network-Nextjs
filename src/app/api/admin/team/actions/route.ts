import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TeamMember from "@/models/TeamMember";
import TermTenure from "@/models/TermTenure";
import Term from "@/models/Term";
import Committee from "@/models/Committee";
import Role from "@/models/Role";
import PromotionLog from "@/models/PromotionLog";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";
import { syncTeamMemberLegacyProfile } from "@/lib/teamLegacySync";

// Minimal admin actions: promote, endTenure, copy, remove
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;

    const body = await req.json();
    const { action, memberId, tenureId, toRoleId, termId, committeeId, reason, targetTermId, targetCommitteeId, targetRoleId } = body || {};

    if (!action || !memberId) {
      return NextResponse.json({ message: "action and memberId are required" }, { status: 400 });
    }

    const mongoose = (await import("mongoose")).default;

    if (action === "promote") {
      if (!toRoleId) return NextResponse.json({ message: "toRoleId required for promote" }, { status: 400 });

      const activeTenures = await TermTenure.find({ memberId: new mongoose.Types.ObjectId(memberId), status: "ACTIVE" });
      if (!activeTenures || activeTenures.length === 0) {
        if (!termId || !committeeId) {
          return NextResponse.json({ message: "Choose a term and team to activate this archived member." }, { status: 400 });
        }
        const member = await TeamMember.findById(memberId);
        if (!member) return NextResponse.json({ message: "Team member not found" }, { status: 404 });

        const newTenure = await TermTenure.create({
          memberId: member._id,
          termId: new mongoose.Types.ObjectId(termId),
          committeeId: new mongoose.Types.ObjectId(committeeId),
          roleId: new mongoose.Types.ObjectId(toRoleId),
          status: "ACTIVE",
        });
        const [role, committee, term] = await Promise.all([
          Role.findById(newTenure.roleId),
          Committee.findById(newTenure.committeeId),
          Term.findById(newTenure.termId),
        ]);
        const updatedMember = await TeamMember.findByIdAndUpdate(member._id, {
          $set: {
            role: role?.name || "Member",
            roleType: role?.roleType || "MEMBER",
            team: committee?.name || "Core",
            year: term?.name || "",
            isActive: true,
          },
        }, { new: true });
        if (updatedMember) await syncTeamMemberLegacyProfile(updatedMember);
        return NextResponse.json({ ok: true, action: "promote", updatedCount: 0, newTenure }, { status: 201 });
      }

      // Archive existing active tenures as PROMOTED
      const updated = await TermTenure.updateMany(
        { memberId: new mongoose.Types.ObjectId(memberId), status: "ACTIVE" },
        { $set: { status: "PROMOTED" } }
      );

      // Create a new tenure for promoted role
      const source = activeTenures[0];
      const newTenure = await TermTenure.create({
        memberId: source.memberId,
        termId: termId ? new mongoose.Types.ObjectId(termId) : source.termId,
        committeeId: committeeId ? new mongoose.Types.ObjectId(committeeId) : source.committeeId,
        roleId: new mongoose.Types.ObjectId(toRoleId),
        status: "ACTIVE",
      });

      const [role, committee, term] = await Promise.all([
        Role.findById(newTenure.roleId),
        Committee.findById(newTenure.committeeId),
        Term.findById(newTenure.termId),
      ]);
      const updatedMember = await TeamMember.findByIdAndUpdate(source.memberId, {
        $set: {
          role: role?.name || "Member",
          roleType: role?.roleType || "MEMBER",
          team: committee?.name || "Core",
          year: term?.name || "",
          isActive: true,
        },
      }, { new: true });
      if (updatedMember) await syncTeamMemberLegacyProfile(updatedMember);

      // Log promotion
      await PromotionLog.create({
        memberId: source.memberId,
        fromRoleId: source.roleId,
        toRoleId: new mongoose.Types.ObjectId(toRoleId),
        termId: termId ? new mongoose.Types.ObjectId(termId) : source.termId,
        reason: reason || "",
      });

      return NextResponse.json({ ok: true, action: "promote", updatedCount: updated.modifiedCount, newTenure }, { status: 200 });
    }

    if (action === "endTenure") {
      const mongoose = (await import("mongoose")).default;
      const res = await TermTenure.updateMany(
        { memberId: new mongoose.Types.ObjectId(memberId), status: "ACTIVE" },
        { $set: { status: "ARCHIVED" } }
      );
      return NextResponse.json({ ok: true, action: "endTenure", modified: res.modifiedCount }, { status: 200 });
    }

    if (action === "remove") {
      const objectId = new mongoose.Types.ObjectId(memberId);
      if (tenureId) {
        const removedTenure = await TermTenure.findOneAndUpdate(
          { _id: tenureId, memberId: objectId, status: "ACTIVE" },
          { $set: { status: "REMOVED" } },
          { new: true }
        );
        if (!removedTenure) return NextResponse.json({ message: "Active term assignment not found" }, { status: 404 });
        const hasActiveTenure = await TermTenure.exists({ memberId: objectId, status: "ACTIVE" });
        await TeamMember.updateOne({ _id: objectId }, { $set: { isActive: Boolean(hasActiveTenure) } });
        return NextResponse.json({ ok: true, action: "remove", tenureId, isActive: Boolean(hasActiveTenure) });
      }
      const res = await TermTenure.updateMany(
        { memberId: objectId },
        { $set: { status: "REMOVED" } }
      );
      // Optionally mark TeamMember as inactive
      await TeamMember.updateOne({ _id: objectId }, { $set: { isActive: false } });
      return NextResponse.json({ ok: true, action: "remove", modified: res.modifiedCount }, { status: 200 });
    }

    if (action === "copy") {
      if (!targetRoleId || !targetTermId || !targetCommitteeId) {
        return NextResponse.json({ message: "targetRoleId, targetTermId and targetCommitteeId are required for copy" }, { status: 400 });
      }
      const mongoose = (await import("mongoose")).default;
      const newTenure = await TermTenure.create({
        memberId: new mongoose.Types.ObjectId(memberId),
        termId: new mongoose.Types.ObjectId(targetTermId),
        committeeId: new mongoose.Types.ObjectId(targetCommitteeId),
        roleId: new mongoose.Types.ObjectId(targetRoleId),
        status: "ACTIVE",
      });
      const [role, committee, term] = await Promise.all([
        Role.findById(newTenure.roleId),
        Committee.findById(newTenure.committeeId),
        Term.findById(newTenure.termId),
      ]);
      const updatedMember = await TeamMember.findByIdAndUpdate(memberId, {
        $set: {
          role: role?.name || "Member",
          roleType: role?.roleType || "MEMBER",
          team: committee?.name || "Core",
          year: term?.name || "",
          isActive: true,
        },
      }, { new: true });
      if (updatedMember) await syncTeamMemberLegacyProfile(updatedMember);
      return NextResponse.json({ ok: true, action: "copy", newTenure }, { status: 201 });
    }

    return NextResponse.json({ message: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

// keep default Node runtime so mongoose works correctly
