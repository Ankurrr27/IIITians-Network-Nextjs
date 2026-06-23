"use client";

import { Rocket, ArrowRight, Sparkles, Code2, Brain, Banknote } from "lucide-react";
import { opportunities } from "@/data/opportunities";
import VerificationBadge from "./VerificationBadge";

interface StartupShowcaseProps {
  isDarkMode: boolean;
  onPostClick: () => void;
}

const ecosystemAreas = [
  { icon: Brain, label: "AI / ML" },
  { icon: Banknote, label: "FinTech" },
  { icon: Code2, label: "EdTech" },
  { icon: Sparkles, label: "HealthTech" },
];

export default function StartupShowcase({ isDarkMode, onPostClick }: StartupShowcaseProps) {
  const startupOpps = opportunities.filter((o) => o.category === "Startups").slice(0, 3);

  return (
    <section
      id="startups"
      className={`rounded-2xl border p-6 sm:p-8 transition-colors duration-300 ${
        isDarkMode
          ? "border-slate-800 bg-slate-900/60"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Rocket size={16} className={isDarkMode ? "text-amber-400" : "text-amber-600"} />
            <p
              className={`text-xs font-semibold uppercase tracking-[0.24em] ${
                isDarkMode ? "text-amber-400" : "text-amber-600"
              }`}
            >
              Startup Ecosystem
            </p>
          </div>
          <h2
            className={`mt-3 text-xl font-bold tracking-tight sm:text-2xl ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Startup Opportunities from the IIIT Ecosystem
          </h2>
          <p
            className={`mt-2 max-w-2xl text-sm leading-relaxed ${
              isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"
            }`}
          >
            The IIIT network produces builders, researchers, and founders. Explore founding
            engineer roles, growth internships, and early-stage opportunities from startups
            built by IIITians.
          </p>
        </div>

        <button
          onClick={onPostClick}
          className="shrink-0 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 active:scale-95 self-start sm:self-auto"
        >
          Pitch Your Startup
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Ecosystem Areas */}
      <div className="mt-5 flex flex-wrap gap-2">
        {ecosystemAreas.map((area) => {
          const Icon = area.icon;
          return (
            <div
              key={area.label}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                isDarkMode
                  ? "border-slate-800 bg-slate-950/50 text-slate-300"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              <Icon size={12} className={isDarkMode ? "text-amber-400" : "text-amber-600"} />
              {area.label}
            </div>
          );
        })}
        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
            isDarkMode
              ? "border-slate-800 bg-slate-950/50 text-slate-400"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          + More
        </div>
      </div>

      {/* Startup opportunity cards — compact list */}
      {startupOpps.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {startupOpps.map((opp) => (
            <div
              key={opp.id}
              className={`rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                isDarkMode
                  ? "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                  : "border-slate-100 bg-slate-50/80 hover:border-slate-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-700">
                  <Rocket size={8} />
                  Startup
                </span>
                {opp.recruiterVerified && (
                  <VerificationBadge type="recruiter" isDarkMode={isDarkMode} />
                )}
              </div>
              <h3
                className={`mt-2.5 text-sm font-extrabold tracking-tight ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {opp.title}
              </h3>
              <p className="mt-0.5 text-[11px] font-bold text-slate-400">{opp.company}</p>
              <p
                className={`mt-2 text-[11px] leading-relaxed line-clamp-2 ${
                  isDarkMode ? "text-slate-500" : "text-slate-500 font-medium"
                }`}
              >
                {opp.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  {opp.compensation}
                </span>
                <a
                  href={opp.applicationLink}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition"
                >
                  Learn more →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VC-facing trust message */}
      <div
        className={`mt-6 rounded-xl border px-4 py-3 text-xs font-semibold leading-5 ${
          isDarkMode
            ? "border-amber-900/30 bg-amber-950/20 text-amber-400/80"
            : "border-amber-100 bg-amber-50/60 text-amber-700"
        }`}
      >
        <strong>For VCs and Investors:</strong> IIITians are building across AI, FinTech,
        EdTech, HealthTech, SaaS, and more. This network connects you directly to
        early-stage talent and founding teams from India&apos;s top technical institutes.{" "}
        <a
          href="mailto:iiitiansnetwork@gmail.com?subject=Investor Inquiry – IIITians Network"
          className="underline transition hover:text-amber-900"
        >
          Get in touch
        </a>
      </div>
    </section>
  );
}
