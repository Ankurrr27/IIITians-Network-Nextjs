import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Alumni from "@/models/Alumni";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

const escapeRegex = (v = "") => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/alumni/admin/requests
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;

    const url = req.nextUrl;
    const status = url.searchParams.get("status") || "all";
    const search = url.searchParams.get("search") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { $and: [] };
    if (status.trim() && status !== "all") {
      if (status === "approved") query.$and.push({ $or: [{ status: "approved" }, { status: { $exists: false } }] });
      else query.$and.push({ status: status.trim() });
    }
    if (search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      query.$and.push({ $or: [{ name: regex }, { email: regex }, { iiit: regex }, { branch: regex }, { networkPost: regex }, { currentRole: regex }, { currentCompany: regex }] });
    }
    const finalQuery = query.$and.length ? query : {};
    const alumni = await Alumni.find(finalQuery).sort({ status: 1, createdAt: -1 });
    return NextResponse.json(alumni);
  } catch {
    return NextResponse.json({ message: "Failed to fetch alumni requests" }, { status: 500 });
  }
}
