import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import PopupSettings from "@/models/PopupSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const settings = await PopupSettings.findOne({ key: "tournament_popup" }).lean();
    const now = Date.now();
    const active = Boolean(
      settings?.enabled &&
        (!settings.startsAt || new Date(settings.startsAt).getTime() <= now) &&
        (!settings.endsAt || now < new Date(settings.endsAt).getTime())
    );

    return NextResponse.json(
      { active },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json(
      { active: false },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
