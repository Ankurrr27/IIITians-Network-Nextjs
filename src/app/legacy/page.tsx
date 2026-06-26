// SSR Server Component for /legacy
import type { Metadata } from "next";
import connectDB from "@/lib/mongoose";

export const dynamic = 'force-dynamic';

import Alumni from "@/models/Alumni";
import type { IAlumni } from "@/types";
import LegacyClient from "./LegacyClient";

export const metadata: Metadata = {
  title: "Network Legacy",
  description: "Discover IIITians who shaped the network — alumni, past team members, and student leaders.",
};

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function getEarliestYear(alumni: any) {
  let earliest = Infinity;

  if (Array.isArray(alumni.roleHistory)) {
    for (const role of alumni.roleHistory) {
      if (role.year) {
        const match = role.year.match(/\d{4}/);
        if (match) {
          const y = parseInt(match[0], 10);
          if (y < earliest) earliest = y;
        }
      }
    }
  }

  if (alumni.generation) {
    const match = alumni.generation.match(/\d{4}/);
    if (match) {
      const y = parseInt(match[0], 10);
      if (y < earliest) earliest = y;
    }
  }

  if (earliest === Infinity && alumni.graduationYear) {
    earliest = alumni.graduationYear - 4;
  }

  return earliest === Infinity ? 9999 : earliest;
}

export default async function LegacyPage() {
  let alumni: any[] = [];
  try {
    await connectDB();
    const rawAlumni = await Alumni.find({
      $or: [{ status: "approved" }, { status: { $exists: false } }],
    })
      .sort({ graduationYear: -1, createdAt: -1 })
      .limit(300)
      .lean();

    // Sort oldest members first: earliest joining year first, then graduation year, then earliest created first
    alumni = [...rawAlumni].sort((a, b) => {
      const yearA = getEarliestYear(a);
      const yearB = getEarliestYear(b);
      if (yearA !== yearB) return yearA - yearB;

      const gradA = a.graduationYear || 9999;
      const gradB = b.graduationYear || 9999;
      if (gradA !== gradB) return gradA - gradB;

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 9999999999999;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 9999999999999;
      return dateA - dateB;
    });
  } catch (error) {
    console.error("Failed to fetch legacy members from DB:", error);
  }

  return <LegacyClient initialAlumni={serialize(alumni) as unknown as IAlumni[]} />;
}
