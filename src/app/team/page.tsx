// SSR Server Component for /team
import type { Metadata } from "next";
import connectDB from "@/lib/mongoose";

export const dynamic = 'force-dynamic';

import TeamMember from "@/models/TeamMember";
import type { ITeamMember } from "@/types";
import { Suspense } from "react";
import TeamClient from "./TeamClient";
import LogoLoader from "@/components/LogoLoader";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the passionate students behind IIITians Network — the team building India's premier IIIT community.",
};

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export default async function TeamPage() {
  let members: any[] = [];
  try {
    await connectDB();
    members = await TeamMember.find().sort({ order: 1, createdAt: 1 }).lean();
  } catch (error) {
    console.error("Failed to fetch team members from DB:", error);
  }
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-white">
        <LogoLoader text="Loading team..." />
      </div>
    }>
      <TeamClient initialMembers={serialize(members) as unknown as ITeamMember[]} />
    </Suspense>
  );
}
