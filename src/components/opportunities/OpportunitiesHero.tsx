"use client";

import { ArrowRight, Building2, ShieldCheck } from "lucide-react";

interface OpportunitiesHeroProps {
  isDarkMode: boolean;
  onPostClick: () => void;
}

export default function OpportunitiesHero({ isDarkMode, onPostClick }: OpportunitiesHeroProps) {
  const scrollToListings = () => {
    const el = document.getElementById("opportunities-listings");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="mb-8">
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        {/* Left — Title + Subtitle */}
        <div>
          <h1
            className={`text-2xl font-semibold tracking-tight sm:text-4xl ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Opportunities Across The{" "}
            <span className={isDarkMode ? "text-indigo-400 font-semibold" : "text-indigo-600 font-semibold"}>
              IIIT Network
            </span>
          </h1>
          <p
            className={`mt-3 max-w-2xl text-sm font-medium leading-6 ${
              isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"
            }`}
          >
            Discover internships, research positions, open source programs, startup roles,
            hackathons, and full-time opportunities from recruiters hiring across India&apos;s
            IIIT ecosystem.
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={scrollToListings}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95"
            >
              Explore Opportunities
              <ArrowRight size={14} />
            </button>
            <button
              onClick={onPostClick}
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-xs font-bold shadow-sm transition active:scale-95 ${
                isDarkMode
                  ? "border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700 hover:text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              Post Opportunity
            </button>
          </div>
        </div>

        {/* Right — Info cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div
            className={`rounded-xl border px-4 py-3 shadow-sm backdrop-blur-md transition-all duration-300 ${
              isDarkMode
                ? "border-slate-800 bg-slate-900/40 text-slate-100"
                : "border-slate-200 bg-white/70 text-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 size={14} className={isDarkMode ? "text-indigo-400" : "text-indigo-600"} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Reach
              </p>
            </div>
            <p className={`mt-2 text-sm font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-800"}`}>
              25+ IIITs connected through one platform
            </p>
          </div>
          <div
            className={`rounded-xl border px-4 py-3 shadow-sm backdrop-blur-md transition-all duration-300 ${
              isDarkMode
                ? "border-slate-800 bg-slate-900/40 text-slate-100"
                : "border-slate-200 bg-white/70 text-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className={isDarkMode ? "text-emerald-400" : "text-emerald-600"} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Trust
              </p>
            </div>
            <p className={`mt-2 text-sm font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-800"}`}>
              Verified recruiters and companies only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
