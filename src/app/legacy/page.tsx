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

export const revalidate = 60;

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export default async function LegacyPage() {
  await connectDB();
  const alumni = await Alumni.find({
    $or: [{ status: "approved" }, { status: { $exists: false } }],
  })
    .sort({ graduationYear: -1, createdAt: -1 })
    .limit(300)
    .lean();

  return <LegacyClient initialAlumni={serialize(alumni) as unknown as IAlumni[]} />;
}
