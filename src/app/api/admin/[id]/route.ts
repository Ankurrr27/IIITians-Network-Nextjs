import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

function sanitizeAdmin(admin: InstanceType<typeof Admin>) {
  return { id: admin._id, email: admin.email, role: admin.role, lastLogin: admin.lastLogin, createdAt: admin.createdAt };
}

async function ensureAdminRole(admin: InstanceType<typeof Admin>) {
  const allAdmins = await Admin.find().select("_id role createdAt").sort({ createdAt: 1, _id: 1 });
  const hasSuperAdmin = allAdmins.some((e) => e.role === "super_admin");
  const oldest = allAdmins[0];
  const shouldBeSuperAdmin = !hasSuperAdmin && oldest && String(oldest._id) === String(admin._id);
  if (admin.role === "super_admin") return admin;
  const nextRole = shouldBeSuperAdmin ? "super_admin" : admin.role || "admin";
  if (admin.role !== nextRole) { admin.role = nextRole as "super_admin" | "admin"; await admin.save(); }
  return admin;
}

async function getAuthorizedSuperAdmin(adminId: string) {
  const current = await Admin.findById(adminId);
  if (!current) return null;
  const resolved = await ensureAdminRole(current);
  return resolved.role === "super_admin" ? resolved : null;
}

// PATCH /api/admin/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const superAdmin = await getAuthorizedSuperAdmin(payload.id);
    if (!superAdmin) return NextResponse.json({ message: "Only a super admin can edit admins" }, { status: 403 });

    const target = await Admin.findById(id);
    if (!target) return NextResponse.json({ message: "Admin not found" }, { status: 404 });

    const body = await req.json();
    const normalized = body.email?.trim().toLowerCase();
    const nextRole = body.role?.trim();
    const nextPassword = body.password?.trim();

    if (!normalized) return NextResponse.json({ message: "Email is required" }, { status: 400 });
    if (nextRole && !["super_admin", "admin"].includes(nextRole))
      return NextResponse.json({ message: "Invalid role selected" }, { status: 400 });

    const duplicate = await Admin.findOne({ email: normalized, _id: { $ne: target._id } });
    if (duplicate) return NextResponse.json({ message: "Admin email already exists" }, { status: 409 });

    if (target.role === "super_admin" && nextRole === "admin" && String(target._id) === String(superAdmin._id))
      return NextResponse.json({ message: "You cannot demote your own super admin account" }, { status: 400 });

    target.email = normalized;
    if (nextRole) target.role = nextRole;
    if (nextPassword) target.password = await bcrypt.hash(nextPassword, 10);
    await target.save();
    await ensureAdminRole(target);

    return NextResponse.json({ message: "Admin updated successfully", admin: sanitizeAdmin(target) });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

// DELETE /api/admin/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const superAdmin = await getAuthorizedSuperAdmin(payload.id);
    if (!superAdmin) return NextResponse.json({ message: "Only a super admin can remove admins" }, { status: 403 });
    if (String(id) === String(superAdmin._id))
      return NextResponse.json({ message: "You cannot remove your own admin account" }, { status: 400 });

    const target = await Admin.findById(id);
    if (!target) return NextResponse.json({ message: "Admin not found" }, { status: 404 });
    if (target.role === "super_admin")
      return NextResponse.json({ message: "Remove or transfer super admin access manually instead" }, { status: 400 });

    await Admin.findByIdAndDelete(id);
    return NextResponse.json({ message: "Admin removed successfully" });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
