"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import type { ITeamMember } from "@/types";
import { notifyPageEntry } from "@/utils/appNotifications";
import TeamMemberCard from "@/components/team/TeamMemberCard";

interface Props {
  initialMembers: ITeamMember[];
}

const ROLE_ORDER = ["EXEC", "LEAD", "MEMBER"] as const;

export default function TeamClient({ initialMembers }: Props) {
  const [filter, setFilter] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  useEffect(() => {
    notifyPageEntry("Team page loaded", "Meet the people behind IIITians Network.", "page-team-loaded");
  }, []);

  const teams = ["All", ...Array.from(new Set(initialMembers.map((m) => m.team)))];
  const years = Array.from(new Set(initialMembers.map((m) => m.year))).sort((a, b) => b.localeCompare(a));

  const filtered = initialMembers.filter((m) => {
    const matchesTeam = filter === "All" || m.team === filter;
    const matchesYear = selectedYear === "All" || m.year === selectedYear;
    return matchesTeam && matchesYear;
  });
  const sorted = [...filtered].sort((a, b) => ROLE_ORDER.indexOf(a.roleType) - ROLE_ORDER.indexOf(b.roleType) || (a.order ?? 0) - (b.order ?? 0));

  const displayYears = selectedYear === "All" ? years : [selectedYear];

  return (
    <main className="relative min-h-screen bg-[linear-gradient(180deg,_#f5f3ff_0%,_#f9fcff_50%,_#f9fcff_100%)] pb-20 pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.15),transparent_22%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.10),transparent_22%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <header className="mb-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-500">The Team</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            People Behind the <span className="text-indigo-600">Network</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">
            {initialMembers.length} passionate students driving IIITians Network forward.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/team/join" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700">
              Join the Team →
            </Link>
          </div>
        </header>

        {/* Filter tabs */}
        <div className="flex flex-col gap-3 mb-10 items-center justify-center">
          <div className="flex flex-wrap justify-center gap-2">
            {teams.map((team) => (
              <button key={team} onClick={() => setFilter(team)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filter === team ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600"}`}>
                {team}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {["All", ...years].map((year) => (
              <button key={year} onClick={() => setSelectedYear(year)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${selectedYear === year ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600"}`}>
                {year === "All" ? "All Batches" : `Batch ${year}`}
              </button>
            ))}
          </div>
        </div>

        {/* Members grid — grouped by year */}
        {displayYears.map((year) => {
          const yearMembers = sorted.filter((m) => m.year === year);
          if (!yearMembers.length) return null;
          return (
            <section key={year} className="mb-12">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">Batch {year}</h2>
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {yearMembers.map((member) => (
                  <TeamMemberCard key={member._id} member={member} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
