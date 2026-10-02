// SSR Server Component for /team
import type { Metadata } from "next";
import connectDB from "@/lib/mongoose";

export const dynamic = 'force-dynamic';

import TeamMember from "@/models/TeamMember";
import TermTenure from "@/models/TermTenure";
// Register every model referenced by TermTenure before Mongoose populates them.
import Term from "@/models/Term";
import Committee from "@/models/Committee";
import Role from "@/models/Role";
import type { ITeamMember } from "@/types";
import { compareTermsNewestFirst } from "@/lib/termSort";
import { Suspense } from "react";
import TeamClient from "./TeamClient";
import LogoLoader from "@/components/LogoLoader";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the passionate students behind IIITians Network — the team building India's premier IIIT community.",
};

interface StoredTeamProfile extends Omit<ITeamMember, "_id" | "memberId" | "createdAt"> {
  _id: { toString(): string };
  createdAt?: Date;
}

interface StoredTermTenure {
  _id: { toString(): string };
  memberId: StoredTeamProfile | null;
  termId: { name?: string } | null;
  committeeId: { name?: string; order?: number } | null;
  roleId: { name?: string; roleType?: string } | null;
  status: "ACTIVE" | "PROMOTED" | "ARCHIVED" | "REMOVED";
  createdAt?: Date;
  updatedAt?: Date;
}

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export default async function TeamPage() {
  let members: ITeamMember[] = [];
  try {
    await connectDB();
    const [rawTenures, rawProfiles] = await Promise.all([
      TermTenure.find({ status: { $ne: "REMOVED" } })
        .populate("memberId")
        .populate({ path: "termId", model: Term })
        .populate({ path: "committeeId", model: Committee })
        .populate({ path: "roleId", model: Role })
        .lean(),
      TeamMember.find().lean(),
    ]);

    const tenures = rawTenures as unknown as StoredTermTenure[];
    const profiles = rawProfiles as unknown as StoredTeamProfile[];
    const statusPriority = { ACTIVE: 0, PROMOTED: 1, ARCHIVED: 2, REMOVED: 3 };
    tenures.sort((left, right) =>
      statusPriority[left.status] - statusPriority[right.status] ||
      (right.updatedAt?.getTime() || 0) - (left.updatedAt?.getTime() || 0)
    );
    const tenureMemberIds = new Set<string>();
    const seenMemberTerms = new Set<string>();
    members = tenures.flatMap((tenure) => {
      const member = tenure.memberId;
      if (!member) return [];
      const memberId = member._id.toString();
      const year = tenure.termId?.name || member.year || "";
      const normalizedTerm = year.trim().toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
      const assignmentKey = `${memberId}:${normalizedTerm || tenure._id.toString()}`;
      if (seenMemberTerms.has(assignmentKey)) return [];
      seenMemberTerms.add(assignmentKey);
      tenureMemberIds.add(memberId);
      const roleType = tenure.roleId?.roleType;
      return [{
        ...member,
        _id: tenure._id.toString(),
        memberId,
        role: tenure.roleId?.name || member.role || "Member",
        roleType: roleType === "EXEC" || roleType === "LEAD" || roleType === "MEMBER" ? roleType : member.roleType || "MEMBER",
        team: tenure.committeeId?.name || member.team || "Core",
        year,
        isActive: tenure.status === "ACTIVE",
        tenureStatus: tenure.status,
        order: tenure.committeeId?.order ?? member.order ?? 9999,
        createdAt: tenure.createdAt || member.createdAt,
      }];
    });

    profiles.sort((left, right) =>
      new Date(right.updatedAt || right.createdAt || 0).getTime() -
      new Date(left.updatedAt || left.createdAt || 0).getTime()
    );
    const seenProfileTerms = new Set<string>();
    for (const profile of profiles) {
      const memberId = profile._id.toString();
      const year = profile.year?.trim() || "";
      const normalizedTerm = year.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
      const email = profile.email.trim().toLowerCase();
      const assignmentKey = `${email}:${normalizedTerm || memberId}`;
      if (
        !tenureMemberIds.has(memberId) &&
        (profile.isActive !== false || Boolean(year)) &&
        !seenProfileTerms.has(assignmentKey)
      ) {
        seenProfileTerms.add(assignmentKey);
        members.push({ ...profile, _id: memberId, memberId, tenureStatus: "PROFILE" });
      }
    }
    members.sort((left, right) => compareTermsNewestFirst(left.year || "", right.year || "") || left.order - right.order);
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
