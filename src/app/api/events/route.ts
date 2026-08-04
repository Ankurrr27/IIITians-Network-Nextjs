import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Event from "@/models/Event";
import { requireAdmin, isNextResponse } from "@/lib/requireAdmin";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find().sort({ date: -1 });
    return NextResponse.json(events);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = requireAdmin(req);
    if (isNextResponse(payload)) return payload;
    
    const formData = await req.formData();
    const file = formData.get("banner") as File | null;
    
    const fields: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "banner") fields[key] = value;
    }

    let bannerData: { public_id?: string; url: string } | undefined;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, { folder: "iiitians/events" });
      bannerData = { public_id: result.public_id, url: result.secure_url };
    }

    const event = await Event.create({
      ...fields,
      banner: bannerData,
    });
    return NextResponse.json(event, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 400 });
  }
}
