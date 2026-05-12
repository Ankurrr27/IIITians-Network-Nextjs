import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

function sanitizeAdmin(admin: InstanceType<typeof Admin>) {
  return {
    id: admin._id,
    email: admin.email,
    role: admin.role,
    lastLogin: admin.lastLogin,
    createdAt: admin.createdAt,
  };
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

// GET /api/admin/me
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;

    const admin = await Admin.findById(payload.id).select("-password");
    if (!admin) return NextResponse.json({ message: "Admin not found" }, { status: 404 });

    const resolved = await ensureAdminRole(admin);
    return NextResponse.json(sanitizeAdmin(resolved));
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
