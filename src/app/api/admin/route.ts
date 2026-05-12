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

// GET /api/admin — list all (super admin only)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const superAdmin = await getAuthorizedSuperAdmin(payload.id);
    if (!superAdmin) return NextResponse.json({ message: "Only a super admin can view admins" }, { status: 403 });
    const admins = await Admin.find().select("-password").sort({ role: 1, createdAt: 1 });
    await Promise.all(admins.map(ensureAdminRole));
    return NextResponse.json(admins.map(sanitizeAdmin));
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

// POST /api/admin — create admin
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password, setupKey } = body;
    const normalized = email?.trim().toLowerCase();
    if (!normalized || !password)
      return NextResponse.json({ message: "Email & password required" }, { status: 400 });

    const adminsCount = await Admin.countDocuments();
    const providedSetupKey = req.headers.get("x-admin-setup-key") || setupKey;

    if (adminsCount > 0 && (!process.env.ADMIN_SETUP_KEY || providedSetupKey !== process.env.ADMIN_SETUP_KEY))
      return NextResponse.json({ message: "Admin creation is disabled" }, { status: 403 });

    if (process.env.ADMIN_SETUP_KEY && providedSetupKey !== process.env.ADMIN_SETUP_KEY)
      return NextResponse.json({ message: "Valid setup key required" }, { status: 403 });

    const exists = await Admin.findOne({ email: normalized });
    if (exists) return NextResponse.json({ message: "Admin already exists" }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email: normalized, password: hashedPassword, role: adminsCount === 0 ? "super_admin" : "admin" });
    return NextResponse.json({ message: "Admin created", admin: sanitizeAdmin(admin) }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
