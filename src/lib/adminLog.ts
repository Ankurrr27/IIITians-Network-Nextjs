import connectDB from "@/lib/mongoose";
import Admin from "@/models/Admin";
import AdminLog from "@/models/AdminLog";

export interface CreateAdminLogArgs {
  adminId: string;
  action: string;
  targetResource: string;
  targetId?: string;
  details?: string;
  adminEmail?: string;
}

export async function createAdminLog(args: CreateAdminLogArgs) {
  await connectDB();
  const adminEmail =
    args.adminEmail ||
    (await Admin.findById(args.adminId).select("email").lean())?.email ||
    "Unknown Admin";

  return AdminLog.create({
    adminId: args.adminId,
    adminEmail,
    action: args.action,
    targetResource: args.targetResource,
    targetId: args.targetId,
    details: args.details,
  });
}
