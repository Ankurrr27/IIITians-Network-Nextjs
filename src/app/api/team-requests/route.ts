import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import TeamMember from "@/models/TeamMember";
import { uploadToCloudinary } from "@/lib/cloudinary";

// POST /api/team-requests — public: submit a join request (creates inactive member)
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

    // Create member with isActive: false (pending admin approval)
    const member = await TeamMember.create({
      name,
      email,
      iiit: iiit || "Unspecified",
      team,
      role,
      roleType: "MEMBER",
      year,
      linkedin,
      instagram,
      twitter,
      aboutText,
      messageText,
      isActive: false,
      ...(photo ? { photo } : {}),
    });

    return NextResponse.json(member, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
