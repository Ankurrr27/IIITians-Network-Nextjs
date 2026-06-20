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

// PATCH /api/discuss/mine/[id] — edit own post
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const accountId = getDiscussAccountId(req);
    if (!accountId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const post = await Discuss.findOne({ _id: id, account: accountId });
    if (!post) return NextResponse.json({ message: "Post not found" }, { status: 404 });

    const { body, photos } = await readDiscussPayload(req);
    const allowed = ["title", "description", "type", "actionLink", "eventDate"];
    allowed.forEach((f) => {
      if (body[f] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (post as any)[f] = body[f];
      }
    });

    if (photos.length > 0) {
      post.photos = photos;
      post.banner = photos[0];
    }

    // Re-evaluate auto-approve
    const account = await DiscussAccount.findById(accountId);
    const isPrivileged = ["club_manager", "publisher"].includes(account?.role ?? "");
    post.status = account?.isAuthorized && isPrivileged ? "approved" : "pending";
    post.isAuthorisedPost = Boolean(account?.isAuthorized);
    post.badgeLabel = account?.badgeLabel || post.badgeLabel;
    post.accountRole = account?.role || post.accountRole;

    await post.save();
    return NextResponse.json(post);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

// DELETE /api/discuss/mine/[id] — delete own post
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const accountId = getDiscussAccountId(req);
    if (!accountId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const post = await Discuss.findOneAndDelete({ _id: id, account: accountId });
    if (!post) return NextResponse.json({ message: "Post not found" }, { status: 404 });

    return NextResponse.json({ message: "Your post was deleted successfully" });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
