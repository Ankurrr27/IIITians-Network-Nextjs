import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TeamMember from "@/models/TeamMember";
import TeamRequest from "@/models/TeamRequest";
import TermTenure from "@/models/TermTenure";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { isNextResponse, requireAdmin } from "@/lib/requireAdmin";
import { compareTermsNewestFirst } from "@/lib/termSort";

export async function GET(req: NextRequest) {
  const payload = requireAdmin(req);
  if (isNextResponse(payload)) return payload;

  try {
    await connectDB();
    const requests = await TeamRequest.find({ status: "pending" }).lean();
    const reviewedMemberIds = new Set(
      (await TeamRequest.distinct("memberId", { memberId: { $ne: null } })).map(String)
    );
    const legacyProfiles = await TeamMember.find({
      isActive: { $ne: true },
      role: "Member",
      team: "Core",
      year: "",
    }).lean();
    const legacyProfileIds = legacyProfiles
      .filter((profile) => !reviewedMemberIds.has(String(profile._id)))
      .map((profile) => profile._id);
    const profilesWithTenures = new Set(
      (await TermTenure.distinct("memberId", { memberId: { $in: legacyProfileIds } })).map(String)
    );

    for (const profile of legacyProfiles) {
      const memberId = String(profile._id);
      if (reviewedMemberIds.has(memberId) || profilesWithTenures.has(memberId)) continue;
      const year = String(profile.createdAt?.getFullYear() || new Date().getFullYear());
      const migratedRequest = await TeamRequest.create({
        applicantType: "NEW",
        name: profile.name,
        email: profile.email,
        iiit: profile.iiit || "Unspecified",
        team: "Core",
        role: "Member",
        year,
        linkedin: profile.linkedin || "",
        instagram: profile.instagram || "",
        twitter: profile.twitter || "",
        aboutText: profile.aboutText || "",
        messageText: profile.messageText || "",
        ...(profile.photo ? { photo: profile.photo } : {}),
        memberId: profile._id,
        status: "pending",
      });
      requests.push(migratedRequest.toObject());
    }

    requests.sort((left, right) =>
      compareTermsNewestFirst(left.year, right.year) ||
      new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
    );
    return NextResponse.json(requests, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

// POST /api/team-requests — public: submit a profile/tenure request for admin review.
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();

    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const iiit = (formData.get("iiit") as string)?.trim();
    const team = (formData.get("team") as string)?.trim() || "Development";
    const role = (formData.get("role") as string)?.trim();
    const year = (formData.get("year") as string)?.trim() || new Date().getFullYear().toString();
    const linkedin = (formData.get("linkedin") as string)?.trim() || "";
    const instagram = (formData.get("instagram") as string)?.trim() || "";
    const twitter = (formData.get("twitter") as string)?.trim() || "";
    const aboutText = (formData.get("aboutText") as string)?.trim() || "";
    const messageText = (formData.get("messageText") as string)?.trim() || "";
    const applicantType = (formData.get("applicantType") as string)?.trim() || "NEW";

    if (!name || !email || !role) {
      return NextResponse.json(
        { message: "Name, email, and role are required." },
        { status: 400 }
      );
    }

    // For new applicants, IIIT is required
    if (applicantType === "NEW" && !iiit) {
      return NextResponse.json(
        { message: "IIIT institute is required for new applicants." },
        { status: 400 }
      );
    }

    // Handle photo upload
    let photo: { public_id?: string; url: string } | undefined;
    const photoFile = formData.get("photo") as File | null;
    if (photoFile && photoFile.size > 0) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const result = await uploadToCloudinary(buffer, {
        folder: "iiitians/team",
      });
      photo = { public_id: result.public_id, url: result.secure_url };
    }

    const existingMember = applicantType === "EXISTING"
      ? await TeamMember.findOne({ email: email.toLowerCase() })
      : null;
    if (applicantType === "EXISTING" && !existingMember) {
      return NextResponse.json({ message: "No existing team profile was found for this email." }, { status: 404 });
    }

    const request = await TeamRequest.create({
      applicantType: applicantType === "EXISTING" ? "EXISTING" : "NEW",
      name,
      email,
      iiit: iiit || existingMember?.iiit || "Unspecified",
      team,
      role,
      year,
      linkedin,
      instagram,
      twitter,
      aboutText,
      messageText,
      ...(photo ? { photo } : {}),
      memberId: existingMember?._id || null,
      status: "pending",
    });

    return NextResponse.json(request, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
