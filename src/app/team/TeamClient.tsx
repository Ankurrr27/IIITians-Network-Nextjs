"use client";
import { useState, useEffect, useMemo } from "react";
import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, UserPlus } from "lucide-react";

import type { ITeamMember } from "@/types";
import { notifyPageEntry } from "@/utils/appNotifications";
import SourceTeamGrid from "@/components/team/SourceTeamGrid";
import PageHeader, { pageHeaderControlClass } from "@/components/PageHeader";

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
    <div className="ui-page-bg relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />

      <section className="relative z-10 pb-2 pt-16 sm:pt-20">
        <div className="ui-page-shell">
          <PageHeader
            title=""
            description=""
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name, role or IIIT"
            filtersClassName="!flex-row"
            filters={
              <>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={`${pageHeaderControlClass} flex-1 min-w-0 sm:flex-none sm:w-44`}
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option === "ALL" ? "All years" : option}
                    </option>
                  ))}
                </select>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`${pageHeaderControlClass} flex-1 min-w-0 sm:flex-none sm:w-44`}
                >
                  {roleFilters.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </>
            }
            actions={
              <>
                <span className="ui-chip">
                  {hasDirectoryData ? years.length - 1 : "Live"} batches
                </span>
                <span className="ui-chip">
                  {hasDirectoryData ? filteredMembers.length : "Fresh"} matching
                </span>
                <Link
                  href="/team/join"
                  className="ui-button ui-button-primary inline-flex h-10 min-h-10 items-center gap-1.5 px-3.5 text-xs"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Join
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            }
          />
        </div>
      </section>

      {/* Members Grid - Organized by Role Type */}
      <section className="ui-page-shell space-y-10 pb-10 pt-4 sm:space-y-12 sm:pb-12">
        {sortedMembers.length > 0 && <SourceTeamGrid members={sortedMembers} />}

        {filteredMembers.length === 0 && (
          <div className="ui-empty">
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
