import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Term from "@/models/Term";
import TeamMember from "@/models/TeamMember";
import TermTenure from "@/models/TermTenure";
import { isNextResponse, requireAdmin } from "@/lib/requireAdmin";
import { compareTermsNewestFirst } from "@/lib/termSort";

function normalizeTermName(name: string): string {
  return name.trim().toLowerCase().replace(/[\s–—]/g, "").replace(/\//g, "-");
}

function getTermDates(name: string): { startDate: Date; endDate: Date } {
  const match = name.match(/^(\d{2,4})(?:\s*[-/]\s*(\d{2,4}))?/);
  let startYear = match ? Number(match[1]) : new Date().getFullYear();
  if (startYear < 100) startYear += 2000;
  let endYear = match?.[2] ? Number(match[2]) : startYear;
  if (match?.[2]?.length === 2) {
    endYear = Math.floor(startYear / 100) * 100 + endYear;
    if (endYear < startYear) endYear += 100;
  } else if (endYear < 100) {
    endYear += 2000;
  }
  return { startDate: new Date(startYear, 0, 1), endDate: new Date(endYear, 11, 31) };
}

export async function GET(req: NextRequest) {
  const payload = requireAdmin(req);
  if (isNextResponse(payload)) return payload;

  try {
    await connectDB();
    const [terms, profiles, tenures] = await Promise.all([
      Term.find().lean(),
      TeamMember.find({ year: { $exists: true, $ne: "" } }).select("year").lean(),
      TermTenure.find({ status: { $ne: "REMOVED" } }).populate("termId", "name").lean(),
    ]);
    const knownTermNames = new Set(terms.map((term) => normalizeTermName(term.name)));
    const actualYears = new Set<string>();
    for (const profile of profiles) {
      const year = profile.year?.trim();
      if (year) actualYears.add(year);
    }
    for (const tenure of tenures) {
      const term = tenure.termId as unknown as { name?: string } | null;
      if (term?.name?.trim()) actualYears.add(term.name.trim());
    }

    for (const year of actualYears) {
      const normalizedYear = normalizeTermName(year);
      if (knownTermNames.has(normalizedYear)) continue;
      const dates = getTermDates(year);
      const term = await Term.findOneAndUpdate(
        { name: year },
        { $setOnInsert: { name: year, ...dates, isActive: false } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      terms.push(term.toObject());
      knownTermNames.add(normalizedYear);
    }

    terms.sort((left, right) => compareTermsNewestFirst(left.name, right.name));
    return NextResponse.json(terms);
  } catch (err: unknown) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const payload = requireAdmin(req);
  if (isNextResponse(payload)) return payload;

  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (!name || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      return NextResponse.json({ message: "Enter a term name and valid dates; end date must be after start date." }, { status: 400 });
    }

    await connectDB();
    const term = await Term.create({ name, startDate, endDate, isActive: false });
    return NextResponse.json(term, { status: 201 });
  } catch (err: unknown) {
    const duplicate = typeof err === "object" && err !== null && "code" in err && err.code === 11000;
    return NextResponse.json(
      { message: duplicate ? "That term already exists." : err instanceof Error ? err.message : "Server error" },
      { status: duplicate ? 409 : 400 }
    );
  }
}
