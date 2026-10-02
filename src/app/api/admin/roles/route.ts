import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Role from "@/models/Role";
import TeamMember from "@/models/TeamMember";
import TermTenure from "@/models/TermTenure";
import { isNextResponse, requireAdmin } from "@/lib/requireAdmin";

export async function GET(req: NextRequest) {
  const payload = requireAdmin(req);
  if (isNextResponse(payload)) return payload;

  try {
    await connectDB();
    const [profiles, activeTenures] = await Promise.all([
      TeamMember.find({ role: { $exists: true, $ne: "" } }).select("role roleType").lean(),
      TermTenure.find({ status: { $ne: "REMOVED" } }).populate("roleId", "name roleType").lean(),
    ]);

    const actualRoles = new Map<string, "EXEC" | "LEAD" | "MEMBER">();
    for (const profile of profiles) {
      const name = profile.role?.trim();
      if (!name) continue;
      const roleType = ["EXEC", "LEAD", "MEMBER"].includes(profile.roleType || "")
        ? profile.roleType as "EXEC" | "LEAD" | "MEMBER"
        : "MEMBER";
      actualRoles.set(name, roleType);
    }
    for (const tenure of activeTenures) {
      const assignedRole = tenure.roleId as unknown as { name?: string; roleType?: string } | null;
      const name = assignedRole?.name?.trim();
      if (!assignedRole || !name) continue;
      const roleType = ["EXEC", "LEAD", "MEMBER"].includes(assignedRole.roleType || "")
        ? assignedRole.roleType as "EXEC" | "LEAD" | "MEMBER"
        : "MEMBER";
      actualRoles.set(name, roleType);
    }

    for (const [name, roleType] of actualRoles) {
      const level = roleType === "EXEC" ? 100 : roleType === "LEAD" ? 50 : 10;
      await Role.updateOne(
        { name },
        { $setOnInsert: { name, roleType, level, permissions: [], isCustom: false } },
        { upsert: true }
      );
    }

    const roleNames = [...actualRoles.keys()];
    const roles = await Role.find({ $or: [{ isCustom: true }, { name: { $in: roleNames } }] })
      .sort({ level: -1, name: 1 })
      .lean();
    return NextResponse.json(roles);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const payload = requireAdmin(req);
  if (isNextResponse(payload)) return payload;

  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const roleType = body.roleType;
    const level = Number(body.level);
    if (!name || !["EXEC", "LEAD", "MEMBER"].includes(roleType) || !Number.isFinite(level)) {
      return NextResponse.json({ message: "Enter a position name, type, and numeric level." }, { status: 400 });
    }

    await connectDB();
    const role = await Role.create({ name, roleType, level, permissions: [], isCustom: true });
    return NextResponse.json(role, { status: 201 });
  } catch (err: unknown) {
    const duplicate = typeof err === "object" && err !== null && "code" in err && err.code === 11000;
    return NextResponse.json(
      { message: duplicate ? "That position already exists." : err instanceof Error ? err.message : "Server error" },
      { status: duplicate ? 409 : 400 }
    );
  }
}
