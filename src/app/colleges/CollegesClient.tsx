"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ICollege, ITeamMember, IAlumni, IDiscussAccount } from "@/types";
import { notifyPageEntry } from "@/utils/appNotifications";
import CollegeCard from "@/components/colleges/CollegeCard";

const RECENT_KEY = "iiitians-network-recent-college-searches";

interface Props {
  initialColleges: ICollege[];
  initialTeamMembers: ITeamMember[];
  initialAlumni: IAlumni[];
  initialDiscussClubs: IDiscussAccount[];
}

export default function CollegesClient({ initialColleges, initialTeamMembers, initialAlumni, initialDiscussClubs }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("NONE");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    notifyPageEntry("Colleges page loaded", "The IIIT directory is ready to explore.", "page-colleges-loaded");
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      setRecentSearches(Array.isArray(stored) ? stored.filter(Boolean) : []);
    } catch { setRecentSearches([]); }
  }, []);

  // Derived filtered/sorted list
  let filtered = initialColleges.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  if (filter === "AZ") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (filter === "ZA") filtered.sort((a, b) => b.name.localeCompare(a.name));
  if (filter === "WEBSITE") filtered = filtered.filter((c) => c.website);
  if (filter === "RECENT") {
    const indexMap = new Map(recentSearches.map((s, i) => [s.toLowerCase(), i]));
    filtered.sort((a, b) => {
      const ia = indexMap.get(a.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      const ib = indexMap.get(b.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      return ia !== ib ? ia - ib : a.name.localeCompare(b.name);
    });
  }

  const handleRecentSearch = (name: string) => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      const next = [name, ...stored.filter((s: string) => s.toLowerCase() !== name.toLowerCase())].slice(0, 8);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <section className="relative min-h-screen bg-[linear-gradient(180deg,_#eef7ff_0%,_#f7fbff_36%,_#f9fcff_100%)] pb-14 pt-20 sm:pb-16 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-500">IIIT Directory</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Explore <span className="text-indigo-600">India&rsquo;s IIITs</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500">
            {initialColleges.length} institutions — Discover campuses, clubs, alumni, placement data and more.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by college name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-5 py-3 text-sm text-slate-900 shadow-sm outline-none ring-1 ring-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400 sm:max-w-md"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-400"
          >
            <option value="NONE">Sort: Default</option>
            <option value="AZ">A → Z</option>
            <option value="ZA">Z → A</option>
            <option value="WEBSITE">Has Website</option>
            {recentSearches.length > 0 && <option value="RECENT">Recently Searched</option>}
          </select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="py-20 text-center text-slate-400">No colleges found matching &quot;{search}&quot;</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((college) => {
              const memberCount = initialTeamMembers.filter((m) => m.iiit === college.name).length;
              const alumniCount = initialAlumni.filter((a) => a.iiit === college.name).length;
              const clubCount = initialDiscussClubs.filter((c) => c.collegeName === college.name).length;
              return (
                <CollegeCard
                  key={college._id}
                  college={college}
                  memberCount={memberCount}
                  alumniCount={alumniCount}
                  clubCount={clubCount}
                  onRecentSearchClick={handleRecentSearch}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
