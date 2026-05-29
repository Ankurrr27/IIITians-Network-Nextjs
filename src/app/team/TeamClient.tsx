"use client";
import { useState, useEffect, useMemo } from "react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Search, SlidersHorizontal, Users, UserPlus, Linkedin, Instagram } from "lucide-react";

import type { ITeamMember } from "@/types";
import { notifyPageEntry } from "@/utils/appNotifications";
import TeamMemberCard from "@/components/team/TeamMemberCard";

interface Props {
  initialMembers: ITeamMember[];
}

const roleFilters = [
  { label: "All", value: "ALL" },
  { label: "Executives", value: "EXEC" },
  { label: "Leads", value: "LEAD" },
  { label: "Team", value: "MEMBER" },
];

const ROLE_ORDER = ["EXEC", "LEAD", "MEMBER"] as const;

function normalizeCollegeName(name: string) {
  const n = (name || "").trim().toLowerCase();
  if (
    n.includes("sricity") ||
    n.includes("sri city") ||
    n === "chittoor" ||
    (n.includes("iiit") && n.includes("chittoor"))
  ) {
    return "iiit sricity_chittoor_canonical";
  }
  return n;
}

export default function TeamClient({ initialMembers }: Props) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [year, setYear] = useState("ALL");
  const [role, setRole] = useState("ALL");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    notifyPageEntry("Team page loaded", "Meet the people behind IIITians Network.", "page-team-loaded");
  }, []);

  const uniqueVisibleCount = useMemo(() => {
    const emails = new Set(
      initialMembers.map((m) => (m.email || "").trim().toLowerCase()).filter(Boolean)
    );
    return emails.size;
  }, [initialMembers]);

  const years = useMemo(() => {
    const values = new Set(initialMembers.map((m) => m.year).filter(Boolean));
    const sortedYears = Array.from(values).sort((a, b) =>
      String(b).localeCompare(String(a), undefined, { numeric: true })
    );
    return ["ALL", ...sortedYears];
  }, [initialMembers]);

  // Auto-select latest year on first render
  useEffect(() => {
    if (year === "ALL" && years.length > 1) {
      setYear(years[1]);
    }
  }, [years, year]);

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    const iiitQuery = searchParams.get("iiit");
    const normalizedIiitQuery = iiitQuery ? normalizeCollegeName(iiitQuery) : null;

    return initialMembers.filter((member) => {
      const memberCollege = normalizeCollegeName(member.iiit);

      const matchesSearch =
        member.name?.toLowerCase().includes(normalizedSearch) ||
        member.role?.toLowerCase().includes(normalizedSearch) ||
        member.iiit?.toLowerCase().includes(normalizedSearch);

      const matchesYear = year === "ALL" || member.year === year;
      const matchesRole = role === "ALL" || member.roleType === role;
      const matchesIiitQuery = !normalizedIiitQuery || memberCollege === normalizedIiitQuery;

      return matchesSearch && matchesYear && matchesRole && matchesIiitQuery;
    });
  }, [initialMembers, search, year, role, searchParams]);

  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort(
      (a, b) =>
        ROLE_ORDER.indexOf(a.roleType as (typeof ROLE_ORDER)[number]) -
        ROLE_ORDER.indexOf(b.roleType as (typeof ROLE_ORDER)[number]) ||
        (a.order ?? 0) - (b.order ?? 0)
    );
  }, [filteredMembers]);

  const hasDirectoryData = initialMembers.length > 0;

  return (
    <div className="relative min-h-screen bg-[linear-gradient(180deg,_#eef7ff_0%,_#f7fbff_36%,_#f9fcff_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />


      {/* Hero Header */}
      <section className="relative z-10 px-4 pb-8 pt-20 sm:px-6 sm:pb-12 sm:pt-24 lg:pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.7))] px-5 py-8 shadow-[0_24px_70px_rgba(148,163,184,0.14)] backdrop-blur-sm sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="pointer-events-none absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.1),transparent_28%)]" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl lg:pr-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 shadow-sm">
                  <Users className="h-4 w-4" />
                  Team Directory
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  Meet the Team
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  The people driving vision, execution, and impact across the IIITians Network.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/team/join"
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_44px_rgba(15,23,42,0.24)]"
                  >
                    <UserPlus className="h-4 w-4" />
                    Join the Team
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/guide"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                  >
                    Learn how we work
                  </Link>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:w-[24rem] lg:flex-shrink-0">
                <div className="rounded-[1.35rem] border border-white/90 bg-white/85 px-4 py-4 shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
                  <div className="text-2xl font-semibold leading-none text-slate-900">
                    {hasDirectoryData ? uniqueVisibleCount : "Soon"}
                  </div>
                  <div className="mt-2 text-sm leading-5 text-slate-600">
                    {hasDirectoryData ? "Visible members" : "Directory syncing"}
                  </div>
                </div>
                <div className="rounded-[1.35rem] border border-white/90 bg-white/85 px-4 py-4 shadow-[0_14px_34px_rgba(148,163,184,0.12)]">
                  <div className="text-2xl font-semibold leading-none text-slate-900">
                    {hasDirectoryData ? years.length - 1 : "Live"}
                  </div>
                  <div className="mt-2 text-sm leading-5 text-slate-600">
                    {hasDirectoryData ? "Active batches" : "Updates enabled"}
                  </div>
                </div>
                <div className="rounded-[1.35rem] border border-white/90 bg-white/85 px-4 py-4 shadow-[0_14px_34px_rgba(148,163,184,0.12)] sm:col-span-2">
                  <div className="text-2xl font-semibold leading-none text-slate-900">
                    {hasDirectoryData ? filteredMembers.length : "Fresh"}
                  </div>
                  <div className="mt-2 text-sm leading-5 text-slate-600">
                    {hasDirectoryData ? "Matching current filters" : "Profiles coming in"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-indigo-100 to-transparent" />
        </div>
      </section>

      {/* Filters Section */}
      <section className="px-4 pb-2 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.92))] p-4 shadow-[0_20px_50px_rgba(148,163,184,0.1)] sm:p-6">
            <div className="max-w-2xl px-1 pb-4 sm:px-0 sm:pb-5">
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Search Team Directory
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Filter by name, role, IIIT, batch, or team category.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="flex items-center gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <label className="relative block flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, role or IIIT"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white/90 px-11 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowMobileFilters((v) => !v)}
                  className="inline-flex h-[3.15rem] w-[3.15rem] flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md lg:hidden"
                  aria-label="Toggle filters"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div
                className={`${
                  showMobileFilters ? "flex" : "hidden"
                } flex-col gap-3 lg:flex lg:flex-row lg:items-center lg:justify-between`}
              >
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option === "ALL" ? "All Years" : option}
                    </option>
                  ))}
                </select>

                <div className="flex flex-wrap gap-2 rounded-[1.5rem] bg-slate-100/90 p-2">
                  {roleFilters.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setRole(item.value)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        role === item.value
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-white hover:text-indigo-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Members Grid - Organized by Role Type */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 space-y-16">
        {/* Executive Team */}
        {sortedMembers.filter((m) => m.roleType === "EXEC").length > 0 && (
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 mb-10">
              Executive Team
            </h2>
            <div className="space-y-6">
              {sortedMembers.filter((m) => m.roleType === "EXEC").map((member) => (
                <ExecutiveCard key={member._id} member={member} />
              ))}
            </div>
          </div>
        )}

        {/* Team Leads */}
        {sortedMembers.filter((m) => m.roleType === "LEAD").length > 0 && (
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 mb-10">
              Team Lead
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sortedMembers.filter((m) => m.roleType === "LEAD").map((member) => (
                <TeamLeadCard key={member._id} member={member} />
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        {sortedMembers.filter((m) => m.roleType === "MEMBER").length > 0 && (
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 mb-10">
              Members
            </h2>
            {sortedMembers.filter((m) => m.roleType === "MEMBER").length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
                <div className="mx-auto max-w-2xl">
                  <div className="text-xl font-semibold text-slate-900">
                    {hasDirectoryData ? "No members found." : "Members will appear here soon."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {sortedMembers.filter((m) => m.roleType === "MEMBER").map((member) => (
                  <MemberCard key={member._id} member={member} />
                ))}
              </div>
            )}
          </div>
        )}

        {filteredMembers.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto max-w-2xl">
              <div className="text-xl font-semibold text-slate-900">
                {hasDirectoryData ? "No matching team members found." : "The team directory is being refreshed."}
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {hasDirectoryData
                  ? "Try changing the year, role, or search term to see more members."
                  : "Profiles will appear here as soon as live team entries are available."}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Helper Components */}
    </div>
  );
}

// Executive Card Component
function ExecutiveCard({ member }: { member: ITeamMember }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg overflow-hidden">
      <div className="grid gap-0 sm:grid-cols-[320px_1fr] p-0">
        {/* Image */}
        <div className="relative h-64 sm:h-auto overflow-hidden bg-slate-100">
          {member.photo?.url ? (
            <Image
              src={member.photo.url}
              alt={member.name}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-400 to-blue-500">
              <span className="text-6xl font-bold text-white opacity-30">{member.name?.[0]}</span>
            </div>
          )}
          {/* Year Badge */}
          {member.year && (
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white bg-white/95 backdrop-blur px-3 py-1.5 shadow-sm">
              <span className="text-xs font-bold text-slate-900">{member.year}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col p-6 sm:p-8">
          {/* Role Badge + Year */}
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 border border-indigo-200">
              {member.role}
            </span>
            {member.year && <span className="text-xs font-semibold text-slate-500">{member.year}</span>}
          </div>

          {/* Name */}
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{member.name}</h3>

          {/* Position */}
          {member.iiit && (
            <p className="mt-1 text-sm font-semibold text-indigo-600">{member.role} - {member.iiit}</p>
          )}

          {/* About */}
          {member.about && (
            <p className="mt-4 text-sm leading-6 text-slate-600">{member.about}</p>
          )}

          {/* Message */}
          {member.message && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Message</p>
              <p className="mt-2 text-sm text-slate-600 italic">"{member.message}"</p>
            </div>
          )}

          {/* Social Links */}
          <div className="mt-6 flex items-center gap-3">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-indigo-600 transition"
                title="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {member.instagram && (
              <a
                href={member.instagram}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-rose-500 transition"
                title="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Team Lead Card Component
function TeamLeadCard({ member }: { member: ITeamMember }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-lg h-64">
      {/* Image Background */}
      {member.photo?.url ? (
        <Image
          src={member.photo.url}
          alt={member.name}
          fill
          className="object-cover group-hover:scale-105 transition duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
          <span className="text-7xl font-bold text-white opacity-20">{member.name?.[0]}</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Badge */}
      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 backdrop-blur px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
        Lead Team
      </div>

      {/* Social Links - Top Right */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {member.linkedin && (
          <a href={member.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 text-indigo-600 hover:bg-white transition">
            <Linkedin className="h-4 w-4" />
          </a>
        )}
        {member.instagram && (
          <a href={member.instagram} target="_blank" rel="noreferrer" className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 text-rose-500 hover:bg-white transition">
            <Instagram className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Content - Bottom */}
      <div className="absolute bottom-0 inset-x-0 p-4">
        <h4 className="text-lg font-bold text-white">{member.name}</h4>
        {member.iiit && <p className="mt-1 text-sm text-white/90">{member.iiit}</p>}
      </div>
    </div>
  );
}

// Member Card Component
function MemberCard({ member }: { member: ITeamMember }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {member.photo?.url ? (
          <Image
            src={member.photo.url}
            alt={member.name}
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
            <span className="text-5xl font-bold text-white opacity-20">{member.name?.[0]}</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300" />

        {/* Role Badge - Bottom Left */}
        <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-indigo-600/90 backdrop-blur px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white border border-indigo-400">
          {member.role}
        </div>

        {/* Social Links - Bottom Right */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-300">
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-center w-7 h-7 rounded-full bg-white/90 text-indigo-600 hover:bg-white transition">
              <Linkedin className="h-3.5 w-3.5" />
            </a>
          )}
          {member.instagram && (
            <a href={member.instagram} target="_blank" rel="noreferrer" className="flex items-center justify-center w-7 h-7 rounded-full bg-white/90 text-rose-500 hover:bg-white transition">
              <Instagram className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="text-sm font-bold text-slate-900">{member.name}</h4>
        {member.iiit && <p className="mt-0.5 text-xs text-slate-600">{member.iiit}</p>}
      </div>
    </div>
  );
}
