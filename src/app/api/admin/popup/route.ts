import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import PopupSettings from "@/models/PopupSettings";
import { isNextResponse, requireAdmin } from "@/lib/requireAdmin";

const settingsKey = "tournament_popup";

function parseDate(value: unknown): Date | null | undefined {
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function GET(req: NextRequest) {
  const payload = requireAdmin(req);
  if (isNextResponse(payload)) return payload;

  try {
    await connectDB();
    const settings = await PopupSettings.findOneAndUpdate(
      { key: settingsKey },
      { $setOnInsert: { key: settingsKey, enabled: false, startsAt: null, endsAt: null } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json(settings);
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const payload = requireAdmin(req);
  if (isNextResponse(payload)) return payload;

  try {
    const body = await req.json();
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json({ message: "Enabled must be a boolean." }, { status: 400 });
    }

    const startsAt = parseDate(body.startsAt);
    const endsAt = parseDate(body.endsAt);
    if (startsAt === undefined || endsAt === undefined) {
      return NextResponse.json({ message: "Enter valid start and end dates." }, { status: 400 });
    }
    if (startsAt && endsAt && endsAt <= startsAt) {
      return NextResponse.json({ message: "End time must be after start time." }, { status: 400 });
    }

    await connectDB();
    const settings = await PopupSettings.findOneAndUpdate(
      { key: settingsKey },
      { $set: { enabled: body.enabled, startsAt, endsAt } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json(settings);
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 400 }
    );
  }
}
