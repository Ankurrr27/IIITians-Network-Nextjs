"use client";

import { motion } from "framer-motion";
import { Github, Globe, Instagram, Linkedin, Twitter } from "lucide-react";
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
  { key: "linkedin", Icon: Linkedin },
  { key: "github", Icon: Github },
  { key: "instagram", Icon: Instagram },
  { key: "twitter", Icon: Twitter },
  { key: "website", Icon: Globe },
] as const;

const socialLinks = [
  { key: "linkedin", Icon: Linkedin },
  { key: "instagram", Icon: Instagram },
  { key: "twitter", Icon: Twitter },
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

function getLeadershipLabel(role = "") {
  const normalizedRole = role.toLowerCase();
  if (normalizedRole.includes("vice president")) return "Vice President";
  if (normalizedRole.includes("president")) return "President";
  return "Executive Team";
}

function photoUrl(member: ITeamMember) {
  return member.photo?.url || "/placeholder.svg";
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
      ? "mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 xl:grid-cols-3"
      : "mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 xl:grid-cols-4";

  if (!members.length) {
    return <div className="py-12 text-center text-slate-500">No team members found.</div>;
  }

  return (
    <div className="space-y-12 sm:space-y-14">
      {execs.length > 0 && (
        <section>
          <div className="mb-5 text-center sm:mb-6">
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Executive Team
            </h2>
          </div>
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
            {execs.map((member) => (
              <ExecCard key={member._id} member={member as SocialMember} />
            ))}
          </div>
        </section>
      )}

      {leads.length > 0 && (
        <section>
          <div className="mb-5 text-center sm:mb-6">
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Team Lead
            </h2>
          </div>
          <div className={leadGridClass}>
            {leads.map((member) => (
              <LeadCard key={member._id} member={member as SocialMember} />
            ))}
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section>
          <div className="mb-5 text-center sm:mb-6">
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Members
            </h2>
          </div>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6">
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
        className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50 shadow-[0_20px_60px_rgba(79,70,229,0.08)] lg:col-span-2"
      >
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-[170px_1fr] lg:grid-cols-[280px_1fr]">
          <div className="relative mx-3 mt-3 overflow-hidden rounded-[1rem] bg-indigo-100 sm:mx-0 sm:mt-0 sm:rounded-none">
            <img src={photoUrl(member)} alt={member.name} className="aspect-square w-full object-cover object-center sm:h-full sm:aspect-auto" />
            <div className="absolute inset-y-0 right-0 hidden w-8 bg-gradient-to-l from-white/18 to-transparent sm:block" />
          </div>

          <div className="p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:text-xs">
                  {getLeadershipLabel(member.role)}
                </div>
                {member.year && (
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-xs">
                    {member.year}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-indigo-600 sm:text-base">
                  {member.role}
                  {member.iiit ? ` - ${member.iiit}` : ""}
                </p>
              </div>

              <div className="grid gap-3 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="rounded-[1rem] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[1.2rem] sm:p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-xs">About</p>
                  <p className="mt-2 text-[12px] leading-5 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">{about}</p>
                </div>

                <div className="rounded-[1rem] border border-indigo-100 bg-indigo-50/60 p-3 shadow-sm sm:rounded-[1.2rem] sm:p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600 sm:text-xs">Message</p>
                  <p className="mt-2 text-[12px] leading-5 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">"{message}"</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {execSocialLinks.map(({ key, Icon }) =>
                  member[key] ? (
                    <a key={key} href={member[key]} target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                      <Icon size={18} />
                    </a>
                  ) : null
                )}
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
      className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)] transition-shadow hover:shadow-[0_26px_65px_rgba(79,70,229,0.14)]"
    >
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400" />
      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        <div className="relative h-56 overflow-hidden bg-slate-100 md:h-full">
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

          <div className="mt-4 flex flex-wrap gap-2">
            {execSocialLinks.map(({ key, Icon }) =>
              member[key] ? (
                <a key={key} href={member[key]} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                  <Icon size={16} />
                </a>
              ) : null
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function LeadCard({ member }: { member: SocialMember }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100"
    >
      <div className="flex flex-col">
        <div className="relative h-72 w-full overflow-hidden bg-slate-100 sm:h-80">
          <img src={photoUrl(member)} alt={member.name} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />
          
          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700 shadow-sm backdrop-blur-md">Lead Team</span>
            <div className="flex flex-shrink-0 gap-2">
              {socialLinks.map(({ key, Icon }) =>
                member[key] ? (
                  <a key={key} href={member[key]} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white shadow-sm backdrop-blur-md ring-1 ring-white/20 transition-all hover:bg-white hover:text-indigo-600 hover:scale-110">
                    <Icon size={14} />
                  </a>
                ) : null
              )}
            </div>
          </div>

          <div className="absolute left-5 right-5 bottom-5">
            <p className="line-clamp-2 text-xl font-bold leading-tight text-white sm:text-2xl">{member.name}</p>
            <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-300 sm:text-xs">{member.role}</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white">
          <div className="rounded-2xl bg-slate-50/80 px-4 py-3.5 ring-1 ring-slate-100 transition-colors group-hover:bg-indigo-50/50 group-hover:ring-indigo-100">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-400">Institute</p>
            <p className="mt-1 text-sm font-bold text-slate-700 sm:text-base group-hover:text-indigo-900">{member.iiit}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function MemberCard({ member }: { member: SocialMember }) {
  return (
    <article className="group overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(79,70,229,0.10)]">
      <div className="relative overflow-hidden bg-slate-100">
        <img src={photoUrl(member)} alt={member.name} className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent p-2.5">
          <span className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-white/90">{member.role}</span>
          <div className="flex gap-1.5">
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noreferrer" className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-indigo-600 transition hover:bg-white">
                <Linkedin size={13} />
              </a>
            )}
            {member.instagram && (
              <a href={member.instagram} target="_blank" rel="noreferrer" className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-pink-500 transition hover:bg-white">
                <Instagram size={13} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 pt-3 text-center sm:px-3.5 sm:pb-3.5">
        <h4 className="line-clamp-2 text-xs font-semibold leading-tight text-slate-900 sm:text-sm">{member.name}</h4>
        <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-[11px]">{member.iiit}</p>
      </div>
    </article>
  );
}
