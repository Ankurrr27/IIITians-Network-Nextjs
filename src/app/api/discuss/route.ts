import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Discuss from "@/models/Discuss";
import DiscussAccount from "@/models/DiscussAccount";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "@/lib/cloudinary";

function getDiscussAccountId(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const decoded = jwt.verify(auth.split(" ")[1], secret) as { id: string; kind: string };
    if (decoded.kind !== "discuss_account") return null;
    return decoded.id;
  } catch {
    return null;
  }
}

async function readDiscussPayload(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    const body = await req.json();
    return { body, photos: [] as { public_id: string; url: string }[] };
  }

  const formData = await req.formData();
  const body: Record<string, string> = {};
  const files = [
    ...formData.getAll("photos"),
    ...formData.getAll("banners"),
  ].filter((value): value is File => value instanceof File && value.size > 0);

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") body[key] = value;
  }

  const uploaded = await Promise.all(
    files.slice(0, 6).map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, { folder: "iiitians/discuss" });
      return { public_id: result.public_id, url: result.secure_url };
    })
  );

  return { body, photos: uploaded };
}

// GET /api/discuss — approved posts by default, or filter by ?status=
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = req.nextUrl;
    const status = url.searchParams.get("status");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = status ? { status } : { status: "approved" };
    const posts = await Discuss.find(query).sort({ isPinned: -1, createdAt: -1 });
    return NextResponse.json(posts);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

// POST /api/discuss — create a post (requires discuss account token)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const accountId = getDiscussAccountId(req);
    if (!accountId) {
      return NextResponse.json({ message: "Club account login required" }, { status: 401 });
    }

    const account = await DiscussAccount.findById(accountId);
    if (!account) return NextResponse.json({ message: "Discuss account not found" }, { status: 404 });

    const { body, photos } = await readDiscussPayload(req);

    if (body.type === "event" && !account.isAuthorized) {
      return NextResponse.json({ message: "Only verified clubs can post events." }, { status: 403 });
    }

    const post = await Discuss.create({
      title: body.title,
      description: body.description,
      type: body.type || "announcement",
      collegeName: account.collegeName,
      clubName: account.clubName,
      contactName: account.contactName,
      contactEmail: account.email,
      contactPhone: account.contactPhone,
      actionLink: body.actionLink,
      eventDate: body.eventDate || null,
      account: account._id,
      accountRole: account.role,
      isAuthorisedPost: account.isAuthorized,
      badgeLabel: account.badgeLabel,
      status: "pending",
      banner: photos[0],
      photos,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
