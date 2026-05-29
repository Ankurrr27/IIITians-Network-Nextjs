import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Alumni from "@/models/Alumni";
import { signLegacyCertificateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ message: "Registered email is required." }, { status: 400 });
    }

    await connectDB();
    const legacyMember = await Alumni.findOne({
      email: normalizedEmail,
      status: "approved",
    }).lean();

    if (!legacyMember) {
      return NextResponse.json(
        { message: "No approved Legacy profile was found for this email." },
        { status: 404 }
      );
    }

    const token = signLegacyCertificateToken({
      id: String(legacyMember._id),
      email: normalizedEmail,
    });

    return NextResponse.json({
      token,
      member: {
        id: String(legacyMember._id),
        name: legacyMember.name,
        email: legacyMember.email,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not start certificate session." },
      { status: 500 }
    );
  }
}
