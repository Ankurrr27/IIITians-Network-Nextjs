"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link2, Globe, Search } from "lucide-react";

import type { IAlumni } from "@/types";
import { notifyPageEntry } from "@/utils/appNotifications";

interface Props { initialAlumni: IAlumni[]; }

type LegacyTypeFilter = "all" | "alumni" | "team_member";

export default function LegacyClient({ initialAlumni }: Props) {
  const [search, setSearch] = useState("");
  const [iiitFilter, setIiitFilter] = useState("");
  const [legacyTypeFilter, setLegacyTypeFilter] = useState<LegacyTypeFilter>("all");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    notifyPageEntry("Network Legacy loaded", "Explore IIITians who shaped the network.", "page-legacy-loaded");
  }, []);

  const iiiTs = Array.from(new Set(initialAlumni.map((a) => a.iiit))).sort();

  const filtered = initialAlumni.filter((a) => {
    if (legacyTypeFilter !== "all" && a.legacyType !== legacyTypeFilter) return false;
    if (iiitFilter && a.iiit !== iiitFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.iiit.toLowerCase().includes(q) ||
        a.branch?.toLowerCase().includes(q) ||
        a.currentRole?.toLowerCase().includes(q) ||
        a.currentCompany?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <main className="relative min-h-screen bg-[linear-gradient(180deg,_#f0fdf4_0%,_#f9fcff_60%,_#f9fcff_100%)] pb-20 pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_15%_10%,rgba(52,211,153,0.12),transparent_22%),radial-gradient(circle_at_85%_80%,rgba(99,102,241,0.10),transparent_22%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <header className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-600">Network Legacy</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Those Who <span className="text-emerald-600">Built the Network</span>
          </h1>
          <p className="mt-3 text-base text-slate-500">
            {initialAlumni.length} profiles · Alumni, team members, and student leaders.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => setShowForm(true)}
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700">
              Add Your Profile →
            </button>
            <Link href="/admin/legacy" className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Admin
            </Link>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name, college, role…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-9 pr-4 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <select value={iiitFilter} onChange={(e) => setIiitFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-emerald-400">
            <option value="">All IIITs</option>
            {iiiTs.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={legacyTypeFilter} onChange={(e) => setLegacyTypeFilter(e.target.value as LegacyTypeFilter)}
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-emerald-400">
            <option value="all">All Types</option>
            <option value="alumni">Alumni</option>
            <option value="team_member">Team Members</option>
          </select>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="py-20 text-center text-slate-400">No profiles found.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((person) => (
              <article key={person._id} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-emerald-100">
                    {person.photo?.url ? (
                      <Image src={person.photo.url} alt={person.name} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 text-xl font-bold text-white">{person.name[0]}</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900">{person.name}</h3>
                    <p className="truncate text-[11px] text-slate-400">{person.iiit} · {person.graduationYear}</p>
                  </div>
                </div>
                {(person.currentRole || person.currentCompany) && (
                  <p className="mt-3 text-xs text-emerald-700 font-medium">
                    {person.currentRole}{person.currentCompany ? ` @ ${person.currentCompany}` : ""}
                  </p>
                )}
                {person.bio && <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">{person.bio}</p>}
                <div className="mt-3 flex gap-2">
                  {person.linkedin && (
                    <a href={person.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 transition" title="LinkedIn"><Link2 className="h-3.5 w-3.5" /></a>
                  )}
                  {person.instagram && (
                    <a href={person.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-rose-500 transition" title="Instagram"><Globe className="h-3.5 w-3.5" /></a>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${person.legacyType === "team_member" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"}`}>
                    {person.legacyType === "team_member" ? "Team" : "Alumni"}
                  </span>
                  {person.generation && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">{person.generation}</span>}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Add Profile Modal placeholder */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="mb-1 text-lg font-bold text-slate-900">Add Your Profile</h2>
              <p className="mb-4 text-sm text-slate-500">Contact us or fill the form to be added to Legacy.</p>
              <Link href="/contact" onClick={() => setShowForm(false)}
                className="block w-full rounded-xl bg-emerald-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700">
                Go to Contact Page →
              </Link>
              <button onClick={() => setShowForm(false)} className="mt-3 block w-full text-center text-xs text-slate-400 hover:text-slate-600">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
