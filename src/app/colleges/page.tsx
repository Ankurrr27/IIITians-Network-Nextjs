// SSR Server Component for /colleges
// Fetches directly from MongoDB — no API round-trip. Renders initial HTML with data.
import type { Metadata } from "next";
import connectDB from "@/lib/mongoose";

export const dynamic = 'force-dynamic';

import College from "@/models/College";
import TeamMember from "@/models/TeamMember";
import Alumni from "@/models/Alumni";
import DiscussAccount from "@/models/DiscussAccount";
import type { ICollege, ITeamMember, IAlumni, IDiscussAccount } from "@/types";
import { Suspense } from "react";
import CollegesClient from "./CollegesClient";

export const metadata: Metadata = {
  title: "IIIT Colleges Directory",
  description: "Explore all IIITs in the network — photos, clubs, placement data and more.",
};

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export default async function CollegesPage() {
  let colleges: any[] = [];
  let teamMembers: any[] = [];
  let alumni: any[] = [];
  let discussAccounts: any[] = [];

  try {
    await connectDB();
    const [c, t, a, d] = await Promise.all([
      College.find().sort({ name: 1 }).lean(),
      TeamMember.find({ isActive: true }).select("name email iiit photo year").lean(),
      Alumni.find({ $or: [{ status: "approved" }, { status: { $exists: false } }] })
        .select("name email iiit photo generation branch").limit(300).lean(),
      DiscussAccount.find({ isAuthorized: true })
        .select("collegeName clubName badgeLabel role isAuthorized").lean(),
    ]);
    colleges = c;
    teamMembers = t;
    alumni = a;
    discussAccounts = d;
  } catch (error) {
    console.error("Failed to fetch colleges data from DB:", error);
  }

  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    }>
      <CollegesClient
        initialColleges={serialize(colleges) as unknown as ICollege[]}
        initialTeamMembers={serialize(teamMembers) as unknown as ITeamMember[]}
        initialAlumni={serialize(alumni) as unknown as IAlumni[]}
        initialDiscussClubs={serialize(discussAccounts) as unknown as IDiscussAccount[]}
      />
    </Suspense>
  );
}
