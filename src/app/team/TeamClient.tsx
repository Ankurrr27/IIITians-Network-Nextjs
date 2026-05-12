"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link2, Globe, ExternalLink } from "lucide-react";

import type { ITeamMember } from "@/types";
import { notifyPageEntry } from "@/utils/appNotifications";

interface Props {
  initialMembers: ITeamMember[];
}

const ROLE_ORDER = ["EXEC", "LEAD", "MEMBER"] as const;

export default function TeamClient({ initialMembers }: Props) {
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    notifyPageEntry("Team page loaded", "Meet the people behind IIITians Network.", "page-team-loaded");
  }, []);

  const teams = ["All", ...Array.from(new Set(initialMembers.map((m) => m.team)))];
  const years = Array.from(new Set(initialMembers.map((m) => m.year))).sort((a, b) => b.localeCompare(a));

  const filtered = filter === "All" ? initialMembers : initialMembers.filter((m) => m.team === filter);
  const sorted = [...filtered].sort((a, b) => ROLE_ORDER.indexOf(a.roleType) - ROLE_ORDER.indexOf(b.roleType) || (a.order ?? 0) - (b.order ?? 0));

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
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {teams.map((team) => (
            <button key={team} onClick={() => setFilter(team)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${filter === team ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-indigo-50 hover:text-indigo-600"}`}>
              {team}
            </button>
          ))}
        </div>

        {/* Members grid — grouped by year */}
        {years.map((year) => {
          const yearMembers = sorted.filter((m) => m.year === year);
          if (!yearMembers.length) return null;
          return (
            <section key={year} className="mb-12">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-400">Batch {year}</h2>
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {yearMembers.map((member) => (
                  <article key={member._id} className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-indigo-100">
                      {member.photo?.url ? (
                        <Image src={member.photo.url} alt={member.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-400 to-violet-500 text-2xl font-bold text-white">
                          {member.name[0]}
                        </div>
                      )}
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-slate-900">{member.name}</h3>
                    <p className="mt-0.5 text-xs text-indigo-600 font-medium">{member.role}</p>
                    <p className="text-[10px] text-slate-400">{member.team} · {member.iiit}</p>
                    {member.aboutText && <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">{member.aboutText}</p>}
                    <div className="mt-3 flex gap-3">
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="text-slate-400 hover:text-indigo-600 transition"><Link2 className="h-3.5 w-3.5" /></a>
                      )}
                      {member.instagram && (
                        <a href={member.instagram} target="_blank" rel="noreferrer" title="Instagram" className="text-slate-400 hover:text-rose-500 transition"><Globe className="h-3.5 w-3.5" /></a>
                      )}
                      {member.twitter && (
                        <a href={member.twitter} target="_blank" rel="noreferrer" title="Twitter" className="text-slate-400 hover:text-sky-500 transition"><ExternalLink className="h-3.5 w-3.5" /></a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
