import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Event from "@/models/Event";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    
    const formData = await req.formData();
    const file = formData.get("banner") as File | null;
    
    const fields: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "banner") fields[key] = value;
    }

    const existingEvent = await Event.findById(id);
    if (!existingEvent) return NextResponse.json({ message: "Event not found" }, { status: 404 });

    let bannerData = existingEvent.banner;
    if (file) {
      if (bannerData?.public_id) {
        await deleteFromCloudinary(bannerData.public_id);
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, { folder: "iiitians/events" });
      bannerData = { public_id: result.public_id, url: result.secure_url };
    }

    const event = await Event.findByIdAndUpdate(id, { ...fields, banner: bannerData }, { new: true, runValidators: true });
    return NextResponse.json(event);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    const { id } = await params;
    const event = await Event.findById(id);
    if (!event) return NextResponse.json({ message: "Event not found" }, { status: 404 });
    if (event.banner?.public_id) {
      await deleteFromCloudinary(event.banner.public_id);
    }
    await event.deleteOne();
    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
