import mongoose from "mongoose";
import Alumni, { type IRoleHistory } from "@/models/Alumni";

interface TeamLegacySource {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  iiit?: string;
  role?: string;
  team?: string;
  year?: string;
  currentCompany?: string;
  location?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  aboutText?: string;
  messageText?: string;
  photo?: { public_id?: string; url?: string };
}

export async function syncTeamMemberLegacyProfile(member: TeamLegacySource) {
  const email = member.email.trim().toLowerCase();
  const sourceTeamMemberId = typeof member._id === "string"
    ? new mongoose.Types.ObjectId(member._id)
    : member._id;
  const roleHistoryEntry: IRoleHistory = {
    role: member.role?.trim() || "Team Member",
    team: member.team?.trim() || "Core",
    year: member.year?.trim() || "",
  };
  const normalizeTerm = (value: string) => value.trim().toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const alumni = await Alumni.findOne({ email });

  if (alumni) {
    const roleHistory = [...(alumni.roleHistory || [])];
    if (roleHistoryEntry.year) {
      const currentTerm = normalizeTerm(roleHistoryEntry.year);
      const existingIndex = roleHistory.findIndex((entry) => normalizeTerm(entry.year || "") === currentTerm);
      if (existingIndex >= 0) {
        roleHistory[existingIndex] = roleHistoryEntry;
        for (let index = roleHistory.length - 1; index >= 0; index -= 1) {
          if (index !== existingIndex && normalizeTerm(roleHistory[index].year || "") === currentTerm) {
            roleHistory.splice(index, 1);
          }
        }
      } else {
        roleHistory.push(roleHistoryEntry);
      }
    } else {
      const hasRoleEntry = roleHistory.some((entry) =>
        entry.role === roleHistoryEntry.role &&
        entry.team === roleHistoryEntry.team &&
        !entry.year
      );
      if (!hasRoleEntry) roleHistory.push(roleHistoryEntry);
    }

    alumni.sourceTeamMemberId = sourceTeamMemberId;
    alumni.roleHistory = roleHistory;
    alumni.status = "approved";
    alumni.reviewedAt = alumni.reviewedAt || new Date();
    if (alumni.legacyType === "team_member") {
      alumni.name = member.name;
      alumni.iiit = member.iiit || "Unspecified";
      alumni.networkPost = roleHistoryEntry.team;
      alumni.currentRole = roleHistoryEntry.role;
      alumni.currentCompany = member.currentCompany || "";
      alumni.location = member.location || "";
      alumni.linkedin = member.linkedin || "";
      alumni.instagram = member.instagram || "";
      alumni.twitter = member.twitter || "";
      alumni.bio = member.aboutText || "";
      alumni.contribution = member.messageText || "";
      if (member.photo?.url) alumni.photo = member.photo;
    }
    await alumni.save();
    return alumni;
  }

  return Alumni.create({
    name: member.name,
    email,
    iiit: member.iiit || "Unspecified",
    generation: "",
    branch: "",
    networkPost: roleHistoryEntry.team,
    currentRole: roleHistoryEntry.role,
    currentCompany: member.currentCompany || "",
    location: member.location || "",
    linkedin: member.linkedin || "",
    instagram: member.instagram || "",
    twitter: member.twitter || "",
    bio: member.aboutText || "",
    contribution: member.messageText || "",
    ...(member.photo?.url ? { photo: member.photo } : {}),
    status: "approved",
    legacyType: "team_member",
    sourceTeamMemberId,
    roleHistory: [roleHistoryEntry],
    reviewedAt: new Date(),
  });
}
