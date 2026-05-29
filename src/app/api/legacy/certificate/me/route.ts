import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Alumni from "@/models/Alumni";
import { verifyLegacyCertificateToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : "";
    const decoded = token ? verifyLegacyCertificateToken(token) : null;

    if (!decoded) {
      return NextResponse.json({ message: "Certificate session is invalid or expired." }, { status: 401 });
    }

    await connectDB();
    const legacyMember = await Alumni.findOne({
      _id: decoded.id,
      email: decoded.email,
      status: "approved",
    }).lean();

    if (!legacyMember) {
      return NextResponse.json({ message: "Legacy profile was not found." }, { status: 404 });
    }

    return NextResponse.json({
      member: {
        id: String(legacyMember._id),
        name: legacyMember.name,
        email: legacyMember.email,
        iiit: legacyMember.iiit,
        branch: legacyMember.branch,
        generation: legacyMember.generation,
        graduationYear: legacyMember.graduationYear,
        networkPost: legacyMember.networkPost,
        legacyType: legacyMember.legacyType,
        roleHistory: legacyMember.roleHistory || [],
        reviewedAt: legacyMember.reviewedAt,
        createdAt: legacyMember.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ message: "Could not load certificate profile." }, { status: 500 });
  }
}
