import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import College from "@/models/College";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";

const GALLERY_CATEGORIES = ["infrastructure", "clubs", "events", "others"];
function normalizeCategory(cat: unknown) {
  if (typeof cat !== "string") return undefined;
  const n = cat.trim().toLowerCase();
  return GALLERY_CATEGORIES.includes(n) ? n : undefined;
}

// PATCH /api/colleges/[id]/gallery/meta — admin update caption/category
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const { imageUrl, caption, category } = await req.json();
    if (!imageUrl) return NextResponse.json({ message: "imageUrl is required" }, { status: 400 });

    const college = await College.findById(id);
    if (!college) return NextResponse.json({ message: "College not found" }, { status: 404 });

    const target = college.gallery?.find((img) => img.url === imageUrl);
    if (!target) return NextResponse.json({ message: "Gallery image not found" }, { status: 404 });

    if (caption !== undefined) target.caption = typeof caption === "string" ? caption.trim() : "";
    if (category !== undefined) target.category = normalizeCategory(category) as typeof target.category;

    await college.save();
    return NextResponse.json(college);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}
