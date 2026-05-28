// SSR Server Component for /team
import type { Metadata } from "next";
import connectDB from "@/lib/mongoose";

export const dynamic = 'force-dynamic';

import TeamMember from "@/models/TeamMember";
import type { ITeamMember } from "@/types";
import TeamClient from "./TeamClient";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the passionate students behind IIITians Network — the team building India's premier IIIT community.",
};

export const revalidate = 60;

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export default async function TeamPage() {
  await connectDB();
  const members = await TeamMember.find().sort({ order: 1, createdAt: 1 }).lean();
  return <TeamClient initialMembers={serialize(members) as unknown as ITeamMember[]} />;
}
