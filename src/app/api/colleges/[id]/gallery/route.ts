import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import College from "@/models/College";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

const GALLERY_CATEGORIES = ["infrastructure", "clubs", "events", "others"];
function normalizeCategory(cat: unknown) {
  if (typeof cat !== "string") return undefined;
  const n = cat.trim().toLowerCase();
  return GALLERY_CATEGORIES.includes(n) ? n : undefined;
}

// PATCH /api/colleges/[id]/gallery — add images (anyone)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    if (!files.length) return NextResponse.json({ message: "Images are required" }, { status: 400 });

    const captions = formData.getAll("captions") as string[];
    const categories = formData.getAll("categories") as string[];

    const images = await Promise.all(
      files.map(async (file, index) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await uploadToCloudinary(buffer, { folder: "iiitians/colleges/gallery" });
        return {
          public_id: result.public_id,
          url: result.secure_url,
          caption: captions[index] || captions[0] || "",
          category: normalizeCategory(categories[index] || categories[0]),
          createdAt: new Date(),
        };
      })
    );

    const college = await College.findByIdAndUpdate(id, { $push: { gallery: { $each: images } } }, { new: true });
    if (!college) return NextResponse.json({ message: "College not found" }, { status: 404 });
    return NextResponse.json(college);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

// DELETE /api/colleges/[id]/gallery — admin only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ message: "imageUrl is required" }, { status: 400 });

    const college = await College.findById(id);
    if (!college) return NextResponse.json({ message: "College not found" }, { status: 404 });

    const target = college.gallery?.find((img) => img.url === imageUrl);
    if (target?.public_id) await deleteFromCloudinary(target.public_id);

    college.gallery = (college.gallery ?? []).filter((img) => img.url !== imageUrl);
    await college.save();
    return NextResponse.json(college);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
