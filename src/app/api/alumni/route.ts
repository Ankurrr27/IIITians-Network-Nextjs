import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Alumni from "@/models/Alumni";
import TeamMember from "@/models/TeamMember";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

const escapeRegex = (v = "") => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function normalizePayload(body: Record<string, unknown>) {
  return {
    ...body,
    name: (body.name as string)?.trim(),
    email: (body.email as string)?.trim().toLowerCase(),
    iiit: (body.iiit as string)?.trim(),
    generation: (body.generation as string)?.trim(),
    branch: (body.branch as string)?.trim(),
    networkPost: (body.networkPost as string)?.trim() || "",
    currentRole: (body.currentRole as string)?.trim() || "",
    currentCompany: (body.currentCompany as string)?.trim() || "",
    location: (body.location as string)?.trim() || "",
    linkedin: (body.linkedin as string)?.trim() || "",
    instagram: (body.instagram as string)?.trim() || "",
    bio: (body.bio as string)?.trim() || "",
    graduationYear: Number(body.graduationYear),
  };
}

async function resolvePhoto(
  file: File | null,
  body: Record<string, unknown>,
  existingPhoto?: { public_id?: string; url?: string } | null
) {
  if (file) {
    if (existingPhoto?.public_id) await deleteFromCloudinary(existingPhoto.public_id);
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, { folder: "iiitians/alumni" });
    return { public_id: result.public_id, url: result.secure_url };
  }
  // Try to use photo from existing team member
  const email = (body.email as string)?.trim().toLowerCase();
  if (email) {
    const member = await TeamMember.findOne({ email }).sort({ year: -1, order: 1, createdAt: -1 });
    if (member?.photo?.url) return { public_id: member.photo.public_id, url: member.photo.url };
  }
  return existingPhoto || undefined;
}

// GET /api/alumni
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = req.nextUrl;
    const search = url.searchParams.get("search") || "";
    const generation = url.searchParams.get("generation") || "";
    const iiit = url.searchParams.get("iiit") || "";
    const professionalStatus = url.searchParams.get("placed") || "";
    const legacyType = url.searchParams.get("legacyType") || "";
    const networkPost = url.searchParams.get("networkPost") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { $and: [{ $or: [{ status: "approved" }, { status: { $exists: false } }] }] };

    if (generation.trim()) query.$and.push({ generation: new RegExp(`^${escapeRegex(generation.trim())}$`, "i") });
    if (iiit.trim()) query.$and.push({ iiit: new RegExp(escapeRegex(iiit.trim()), "i") });
    if (legacyType.trim()) query.$and.push({ legacyType: legacyType.trim() });
    if (networkPost.trim()) query.$and.push({ networkPost: new RegExp(escapeRegex(networkPost.trim()), "i") });
    if (professionalStatus.trim() === "working") query.$and.push({ $or: [{ currentCompany: { $exists: true, $nin: ["", null] } }, { currentRole: { $exists: true, $nin: ["", null] } }] });
    if (professionalStatus.trim() === "open") query.$and.push({ $and: [{ $or: [{ currentCompany: { $exists: false } }, { currentCompany: "" }, { currentCompany: null }] }, { $or: [{ currentRole: { $exists: false } }, { currentRole: "" }, { currentRole: null }] }] });
    if (search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      query.$and.push({ $or: [{ name: regex }, { iiit: regex }, { branch: regex }, { networkPost: regex }, { currentRole: regex }, { currentCompany: regex }, { location: regex }, { "roleHistory.role": regex }, { "roleHistory.team": regex }] });
    }

    const alumni = await Alumni.find(query).sort({ graduationYear: -1, createdAt: -1 }).limit(200);
    return NextResponse.json(alumni);
  } catch {
    return NextResponse.json({ message: "Failed to fetch alumni" }, { status: 500 });
  }
}

// POST /api/alumni
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();
    const file = formData.get("photo") as File | null;
    const rawBody: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "photo") rawBody[key] = value;
    }
    const payload = normalizePayload(rawBody);
    const required = ["name", "email", "iiit", "generation", "branch", "graduationYear"];
    const missing = required.find((f) => !payload[f as keyof typeof payload]);
    if (missing) return NextResponse.json({ message: `${missing} is required` }, { status: 400 });

    const photo = await resolvePhoto(file, rawBody);
    const alumni = await Alumni.create({ ...payload, photo, status: "pending", reviewedAt: null });
    return NextResponse.json({ message: "Alumni request submitted and pending admin approval.", alumni }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) return NextResponse.json({ message: "An alumni profile with this email already exists" }, { status: 409 });
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
