import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import AdminLog from "@/models/AdminLog";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;

    const search = req.nextUrl.searchParams.get("search")?.trim() || "";
    const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || "1") || 1);
    const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || "15") || 15));

    const query: any = {};
    if (search) {
      query.$or = [
        { adminEmail: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
        { targetResource: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ];
    }

    const totalCount = await AdminLog.countDocuments(query);
    const logs = await AdminLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const data = logs.map((log) => ({
      _id: log._id,
      createdAt: log.createdAt,
      adminEmail: log.adminEmail,
      action: log.action,
      targetResource: log.targetResource,
      details: log.details || "",
    }));

    return NextResponse.json({
      data,
      pagination: {
        pages: Math.max(1, Math.ceil(totalCount / limit)),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
