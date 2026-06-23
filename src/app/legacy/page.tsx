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

    // Sort by most experience / number of terms in network descending
    alumni = [...rawAlumni].sort((a, b) => {
      const termsA = Array.isArray(a.roleHistory) ? a.roleHistory.length : 0;
      const termsB = Array.isArray(b.roleHistory) ? b.roleHistory.length : 0;
      if (termsB !== termsA) return termsB - termsA;

      const gradA = a.graduationYear || 0;
      const gradB = b.graduationYear || 0;
      if (gradB !== gradA) return gradB - gradA;

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Failed to fetch legacy members from DB:", error);
  }

  return <LegacyClient initialAlumni={serialize(alumni) as unknown as IAlumni[]} />;
}
