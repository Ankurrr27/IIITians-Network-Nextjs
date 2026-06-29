// SSR Server Component for /colleges
// Fetches directly from MongoDB — no API round-trip. Renders initial HTML with data.
import type { Metadata } from "next";
import connectDB from "@/lib/mongoose";

export const dynamic = 'force-dynamic';

import College from "@/models/College";
import TeamMember from "@/models/TeamMember";
import Alumni from "@/models/Alumni";
import DiscussAccount from "@/models/DiscussAccount";
import Placement from "@/models/Placement";
import type { ICollege, ITeamMember, IAlumni, IDiscussAccount, IPlacementDocument } from "@/types";
import { Suspense } from "react";
import CollegesClient from "./CollegesClient";
import LogoLoader from "@/components/LogoLoader";

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
  let placements: any[] = [];

  try {
    await connectDB();
    const [c, t, a, d, p] = await Promise.all([
      College.find().sort({ name: 1 }).lean(),
      TeamMember.find({ isActive: true }).select("name email iiit photo year").lean(),
      Alumni.find({ $or: [{ status: "approved" }, { status: { $exists: false } }] })
        .select("name email iiit photo generation branch currentRole currentCompany").limit(300).lean(),
      DiscussAccount.find({ isAuthorized: true })
        .select("collegeName clubName badgeLabel role isAuthorized").lean(),
      Placement.find().populate("college", "name").lean(),
    ]);
    colleges = c;
    teamMembers = t;
    alumni = a;
    discussAccounts = d;
    placements = p;
  } catch (error) {
    console.error("Failed to fetch colleges data from DB:", error);
  }

  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <LogoLoader text="Loading institutes..." />
      </div>
    }>
      <CollegesClient
        initialColleges={serialize(colleges) as unknown as ICollege[]}
        initialTeamMembers={serialize(teamMembers) as unknown as ITeamMember[]}
        initialAlumni={serialize(alumni) as unknown as IAlumni[]}
        initialDiscussClubs={serialize(discussAccounts) as unknown as IDiscussAccount[]}
        initialPlacements={serialize(placements) as unknown as any[]}
      />
    </Suspense>
  );
}
