import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TeamMember from "@/models/TeamMember";
import TermTenure from "@/models/TermTenure";
import PromotionLog from "@/models/PromotionLog";

// Minimal admin actions: promote, endTenure, copy, remove
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { action, memberId, toRoleId, termId, committeeId, reason, targetTermId, targetCommitteeId, targetRoleId } = body || {};

    if (!action || !memberId) {
      return NextResponse.json({ message: "action and memberId are required" }, { status: 400 });
    }

    const mongoose = (await import("mongoose")).default;

    if (action === "promote") {
      if (!toRoleId) return NextResponse.json({ message: "toRoleId required for promote" }, { status: 400 });

      const activeTenures = await TermTenure.find({ memberId: new mongoose.Types.ObjectId(memberId), status: "ACTIVE" });
      if (!activeTenures || activeTenures.length === 0) {
        return NextResponse.json({ message: "No active tenure found for member" }, { status: 404 });
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
      const mongoose = (await import("mongoose")).default;
      const res = await TermTenure.updateMany(
        { memberId: new mongoose.Types.ObjectId(memberId) },
        { $set: { status: "REMOVED" } }
      );
      // Optionally mark TeamMember as inactive
      await TeamMember.updateOne({ _id: new mongoose.Types.ObjectId(memberId) }, { $set: { isActive: false } });
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
      return NextResponse.json({ ok: true, action: "copy", newTenure }, { status: 201 });
    }

    return NextResponse.json({ message: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

// keep default Node runtime so mongoose works correctly
