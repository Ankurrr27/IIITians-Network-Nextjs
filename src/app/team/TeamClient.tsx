"use client";
import { useState, useEffect, useMemo } from "react";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Search, SlidersHorizontal, Users, UserPlus } from "lucide-react";

import type { ITeamMember } from "@/types";
import { notifyPageEntry } from "@/utils/appNotifications";
import SourceTeamGrid from "@/components/team/SourceTeamGrid";

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
        {sortedMembers.length > 0 && <SourceTeamGrid members={sortedMembers} />}

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
