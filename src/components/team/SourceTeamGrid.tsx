"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Github, Globe, Instagram, Linkedin, Twitter, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { ITeamMember } from "@/types";

type SocialMember = ITeamMember & {
  github?: string;
  website?: string;
};

const execPriority = [
  "president",
  "vice president",
  "general secretary",
  "secretary",
  "treasurer",
  "director",
];

const leadPriority = ["head", "lead", "co-lead", "coordinator", "manager"];

const execSocialLinks = [
  { key: "linkedin", Icon: Linkedin, color: "text-[#0077b5]" },
  { key: "github", Icon: Github, color: "text-slate-800" },
  { key: "instagram", Icon: Instagram, color: "text-[#E1306C]" },
  { key: "twitter", Icon: Twitter, color: "text-[#1DA1F2]" },
  { key: "website", Icon: Globe, color: "text-indigo-600" },
] as const;

const socialLinks = [
  { key: "linkedin", Icon: Linkedin, color: "text-[#0077b5]" },
  { key: "instagram", Icon: Instagram, color: "text-[#E1306C]" },
  { key: "twitter", Icon: Twitter, color: "text-[#1DA1F2]" },
] as const;

function getPriorityIndex(role = "", priorityList: string[] = []) {
  const normalizedRole = role.toLowerCase().trim().replace(/\s+/g, " ");
  const matchedItem = [...priorityList]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => b.item.length - a.item.length)
    .find(({ item }) => {
      const normalizedItem = item.toLowerCase().trim();
      const escapedItem = normalizedItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escapedItem}\\b`, "i").test(normalizedRole);
    });

  if (!matchedItem) return priorityList.length;

  const index = priorityList.findIndex((item) => {
    const normalizedItem = item.toLowerCase().trim();
    const escapedItem = normalizedItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return (
      new RegExp(`\\b${escapedItem}\\b`, "i").test(normalizedRole) &&
      normalizedItem === matchedItem.item.toLowerCase().trim()
    );
  });

  return index === -1 ? priorityList.length : index;
}

function compareMembers(a: ITeamMember, b: ITeamMember, priorityList: string[] = [], options: { priorityFirst?: boolean } = {}) {
  const { priorityFirst = false } = options;
  const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : null;
  const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : null;
  const priorityA = getPriorityIndex(a.role, priorityList);
  const priorityB = getPriorityIndex(b.role, priorityList);

  if (priorityFirst && priorityA !== priorityB) return priorityA - priorityB;
  if (orderA !== null && orderB !== null && orderA !== orderB) return orderA - orderB;
  if (orderA !== null && orderB === null) return -1;
  if (orderA === null && orderB !== null) return 1;
  if (priorityA !== priorityB) return priorityA - priorityB;
  return (a.name || "").localeCompare(b.name || "");
}


function photoUrl(member: ITeamMember) {
  return member.photo?.url || "/placeholder.svg";
}

function getNormalizedTeam(member: { role?: string; team?: string }) {
  const r = (member.role || "").toLowerCase();
  const t = (member.team || "").toLowerCase();

  if (r.includes("design") || t.includes("design")) return "Design";
  if (r.includes("content") || t.includes("content")) return "Content";
  if (r.includes("social") || r.includes("media") || t.includes("social") || t.includes("media")) return "Social Media";
  if (r.includes("developer") || r.includes("tech") || r.includes("development") || t.includes("tech") || t.includes("dev")) return "Tech";

  return member.team || "";
}

export default function SourceTeamGrid({ members = [] }: { members: ITeamMember[] }) {
  const execs = members
    .filter((member) => member.roleType === "EXEC")
    .sort((a, b) => compareMembers(a, b, execPriority, { priorityFirst: true }));

  const leads = members
    .filter((member) => member.roleType === "LEAD")
    .sort((a, b) => compareMembers(a, b, leadPriority));

  const team = members
    .filter((member) => member.roleType === "MEMBER")
    .sort((a, b) => compareMembers(a, b));

  const leadGridClass =
    leads.length === 3
      ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      : "grid gap-4 sm:grid-cols-2 xl:grid-cols-4";

  if (!members.length) {
    return <div className="py-12 text-center text-slate-500">No team members found.</div>;
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      {execs.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Executive Team
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {execs.map((member) => (
              <ExecCard key={member._id} member={member as SocialMember} />
            ))}
          </div>
        </section>
      )}

      {leads.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Team Lead
            </h2>
          </div>
          <div className={leadGridClass}>
            {leads.map((member) => (
              <LeadCard key={member._id} member={member as SocialMember} teamMembers={team.filter(m => getNormalizedTeam(m) === getNormalizedTeam(member)) as SocialMember[]} />
            ))}
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section className="hidden sm:block">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Members
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6">
            {team.map((member) => (
              <MemberCard key={member._id} member={member as SocialMember} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ExecCard({ member }: { member: SocialMember }) {
  const normalizedRole = (member.role || "").toLowerCase();
  const isTopExecutive = normalizedRole.includes("president") || normalizedRole.includes("vice president");
  const about =
    member.aboutText ||
    `${member.name} is serving as ${member.role?.toLowerCase() || "a core executive"} and helping guide IIITians Network with stronger continuity, coordination, and student-facing leadership.`;
  const message =
    member.messageText ||
    `${member.name} is working with the team to keep the network more active, accessible, and useful across the IIIT community.`;

  if (isTopExecutive) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        whileHover={{ y: -4 }}
        className="ui-card ui-card-hover overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 lg:col-span-2 mb-4 -mx-4 sm:mx-0 rounded-none sm:rounded-[1.2rem] border-x-0 sm:border-x"
      >
        <div className="flex flex-col sm:grid sm:grid-cols-[170px_1fr] lg:grid-cols-[280px_1fr]">
          {/* Mobile: Row with small avatar. Desktop: Full column with large image */}
          <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-4 sm:gap-0 p-4 sm:p-0 border-b border-slate-100 sm:border-none bg-white sm:bg-indigo-100">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full sm:h-full sm:w-auto sm:rounded-none sm:bg-indigo-100 ring-2 ring-indigo-50 sm:ring-0">
              <img src={photoUrl(member)} alt={member.name} className="h-full w-full object-cover object-center" />
              <div className="absolute inset-y-0 right-0 hidden w-8 bg-gradient-to-l from-white/18 to-transparent sm:block" />
            </div>

            <div className="sm:hidden flex-1 min-w-0">

              <h3 className="text-base font-bold text-slate-900 truncate">{member.name}</h3>
              <p className="mt-0.5 text-[11px] font-medium text-indigo-600 truncate">{member.role} {member.iiit ? `- ${member.iiit}` : ""}</p>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Desktop Header */}


              <div className="hidden sm:block">
                <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-indigo-600 sm:text-base">
                  {member.role} {member.iiit ? `- ${member.iiit}` : ""}
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="bg-transparent sm:bg-white p-0 sm:p-3 sm:rounded-xl sm:border sm:border-slate-200 sm:shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-xs">About</p>
                  <p className="mt-1.5 text-[12px] leading-5 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">{about}</p>
                </div>

                <div className="hidden sm:block rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600 sm:text-xs">Message</p>
                  <p className="mt-1.5 text-[12px] leading-5 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">"{message}"</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 mt-2 sm:border-none sm:pt-0 sm:mt-0">
                <div className="flex flex-wrap gap-2">
                  {execSocialLinks.map(({ key, Icon, color }) =>
                    member[key as keyof SocialMember] ? (
                      <a key={key} href={member[key as keyof SocialMember] as string} target="_blank" rel="noreferrer" className={`inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 ${color}`}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </a>
                    ) : null
                  )}
                </div>
                <Link href={`/legacy?search=${encodeURIComponent(member.name)}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                  See Profile &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="ui-card ui-card-hover group overflow-hidden -mx-4 sm:mx-0 rounded-none sm:rounded-[1.2rem] border-x-0 sm:border-x"
    >
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400" />
      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        <div className="relative h-48 overflow-hidden bg-slate-100 md:h-full">
          <img src={photoUrl(member)} alt={member.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/45 to-transparent md:hidden" />
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:text-xs">Executive Team</span>
            {member.year && <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-xs">{member.year}</span>}
          </div>

          <div className="mt-3">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{member.name}</h3>
            <p className="mt-1 text-sm font-semibold text-indigo-600 sm:text-base">{member.role}</p>
            <p className="mt-1 text-sm text-slate-500">{member.iiit}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap gap-2">
              {execSocialLinks.map(({ key, Icon, color }) =>
                member[key as keyof SocialMember] ? (
                  <a key={key} href={member[key as keyof SocialMember] as string} target="_blank" rel="noreferrer" className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 ${color}`}>
                    <Icon size={16} />
                  </a>
                ) : null
              )}
            </div>
            <Link href={`/legacy?search=${encodeURIComponent(member.name)}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              See Profile &rarr;
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function LeadCard({ member, teamMembers = [] }: { member: SocialMember, teamMembers?: SocialMember[] }) {

  return (
    <div className="flex flex-col">
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="ui-card ui-card-hover group overflow-hidden -mx-4 sm:mx-0 rounded-none sm:rounded-[1.2rem] border-x-0 sm:border-x"
    >
      <div className="relative flex justify-center pt-4 sm:pt-0 sm:block bg-slate-50 sm:bg-slate-100">
        <div className="relative h-20 w-20 sm:h-auto sm:w-full sm:aspect-[3/4] overflow-hidden rounded-full sm:rounded-none ring-2 ring-white sm:ring-0 shadow-sm sm:shadow-none">
          <img src={photoUrl(member)} alt={member.name} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
        </div>
        
        {/* Desktop Overlay */}
        <div className="hidden sm:flex absolute inset-x-0 bottom-0 items-center justify-between gap-2 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-3.5">
          <span className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-white/95">{member.role}</span>
          <div className="flex gap-2">
            {socialLinks.map(({ key, Icon, color }) =>
              member[key as keyof SocialMember] ? (
                <a key={key} href={member[key as keyof SocialMember] as string} target="_blank" rel="noreferrer" className={`${color} transition hover:scale-110 opacity-90 hover:opacity-100 flex items-center justify-center p-1`}>
                  <Icon size={16} />
                </a>
              ) : null
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3 text-center sm:px-5 sm:pb-5 sm:pt-4 bg-white">
        <h4 className="line-clamp-2 text-sm font-extrabold leading-tight text-slate-900 sm:text-base">{member.name}</h4>
        
        {/* Mobile Role */}
        <p className="mt-0.5 sm:hidden text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600 truncate">{member.role}</p>
        
        <p className="mt-1 text-[11px] leading-4 text-slate-500 sm:text-xs truncate">{member.iiit}</p>
        
        {/* Mobile Social Links & Chevron Toggle */}
        <div className="mt-3 flex sm:hidden items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-wrap gap-2.5">
              {socialLinks.map(({ key, Icon, color }) =>
                member[key as keyof SocialMember] ? (
                  <a key={key} href={member[key as keyof SocialMember] as string} target="_blank" rel="noreferrer" className={`${color} opacity-80 hover:opacity-100 transition`}>
                    <Icon className="w-4 h-4" />
                  </a>
                ) : null
              )}
            </div>
          </div>
          <Link href={`/legacy?search=${encodeURIComponent(member.name)}`} className="text-[10px] font-bold text-indigo-600">
            Profile &rarr;
          </Link>
        </div>

        {/* Desktop Profile Link */}
        <div className="hidden sm:block mt-3 border-t border-slate-100 pt-3 text-right">
          <Link href={`/legacy?search=${encodeURIComponent(member.name)}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
            See Profile &rarr;
          </Link>
        </div>
      </div>
    </motion.article>
 
      {teamMembers && teamMembers.length > 0 && (
        <div className="sm:hidden mt-1 mb-2 px-1">
          <div className="grid grid-cols-2 gap-3 pt-2 pb-1">
            {teamMembers.map((m) => (
              <MemberCard key={m._id} member={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MemberCard({ member }: { member: SocialMember }) {
  return (
    <article className="ui-card ui-card-hover group overflow-hidden">
      <div className="relative flex justify-center pt-4 sm:pt-0 sm:block bg-slate-50 sm:bg-slate-100">
        <div className="relative h-16 w-16 sm:h-auto sm:w-full sm:aspect-[3/4] overflow-hidden rounded-full sm:rounded-none ring-2 ring-white sm:ring-0 shadow-sm sm:shadow-none">
          <img src={photoUrl(member)} alt={member.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        </div>
        
        {/* Desktop Overlay */}
        <div className="hidden sm:flex absolute inset-x-0 bottom-0 items-center justify-between gap-2 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-2.5">
          <span className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-white/90">{member.role}</span>
          <div className="flex gap-1.5">
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-[#0077b5] transition hover:scale-110 opacity-90 hover:opacity-100 flex items-center justify-center p-1">
                <Linkedin size={15} />
              </a>
            )}
            {member.instagram && (
              <a href={member.instagram} target="_blank" rel="noreferrer" className="text-[#E1306C] transition hover:scale-110 opacity-90 hover:opacity-100 flex items-center justify-center p-1">
                <Instagram size={15} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 pt-2.5 text-center sm:px-3.5 sm:pb-3.5 sm:pt-3">
        <h4 className="line-clamp-2 text-xs font-semibold leading-tight text-slate-900 sm:text-sm">{member.name}</h4>
        
        {/* Mobile Role */}
        <p className="mt-0.5 sm:hidden text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-600 truncate">{member.role}</p>
        
        <p className="mt-0.5 sm:mt-1 text-[10px] leading-4 text-slate-500 sm:text-[11px] truncate">{member.iiit}</p>
        
        {/* Mobile Social Links */}
        <div className="mt-2 flex sm:hidden justify-center gap-2">
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-[#0077b5] opacity-80 hover:opacity-100 transition">
              <Linkedin size={13} />
            </a>
          )}
          {member.instagram && (
            <a href={member.instagram} target="_blank" rel="noreferrer" className="text-[#E1306C] opacity-80 hover:opacity-100 transition">
              <Instagram size={13} />
            </a>
          )}
        </div>

        <div className="mt-2.5 border-t border-slate-100 pt-2.5">
          <Link href={`/legacy?search=${encodeURIComponent(member.name)}`} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700">
            See Profile &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
