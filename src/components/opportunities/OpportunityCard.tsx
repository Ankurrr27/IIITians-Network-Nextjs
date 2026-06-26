"use client";

import {
  MapPin,
  Calendar,
  IndianRupee,
  ExternalLink,
  Laptop,
  Building2,
  MapPinned,
} from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import VerificationBadge from "./VerificationBadge";

const workModeConfig: Record<string, { icon: React.ElementType; light: string; dark: string }> = {
  Remote: { icon: Laptop, light: "text-emerald-700 bg-emerald-50", dark: "text-emerald-400 bg-emerald-950/40" },
  Hybrid: { icon: MapPinned, light: "text-amber-700 bg-amber-50", dark: "text-amber-400 bg-amber-950/40" },
  Onsite: { icon: Building2, light: "text-blue-700 bg-blue-50", dark: "text-blue-400 bg-blue-950/40" },
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  isDarkMode: boolean;
  onApply?: (opportunity: Opportunity) => void;
}

export default function OpportunityCard({ opportunity, isDarkMode, onApply }: OpportunityCardProps) {
  const opp = opportunity;
  const mode = workModeConfig[opp.workMode] || workModeConfig.Remote;
  const ModeIcon = mode.icon;

  return (
    <div
      className={`group flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isDarkMode
          ? "border-slate-800 bg-slate-900/40 text-slate-100 hover:border-slate-700"
          : "border-slate-200 bg-white text-slate-900 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.04)]"
      }`}
    >
      <div>
        {/* Top row — badges + meta */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-indigo-600">
            {opp.category}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isDarkMode ? mode.dark : mode.light
            }`}
          >
            <ModeIcon size={10} />
            {opp.workMode}
          </span>

          {opp.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-700">
              ★ Featured
            </span>
          )}
        </div>

        {/* Title + Company */}
        <h3
          className={`mt-3 text-base font-extrabold tracking-tight ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          {opp.title}
        </h3>
        <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-slate-400">
          {opp.company}
        </p>

        {/* Description */}
        <p
          className={`mt-3 text-sm leading-relaxed line-clamp-3 ${
            isDarkMode ? "text-slate-400" : "text-slate-600 font-medium"
          }`}
        >
          {opp.description}
        </p>

        {/* Skills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {opp.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                isDarkMode
                  ? "bg-slate-800 text-slate-300"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MapPin size={10} />
            {opp.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <IndianRupee size={10} />
            {opp.compensation}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={10} />
            {opp.deadline}
          </span>
        </div>
      </div>

      {/* Bottom — verification + action */}
      <div
        className={`mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3.5 ${
          isDarkMode ? "border-slate-800" : "border-slate-100"
        }`}
      >
        <div className="flex flex-wrap gap-1.5">
          {opp.recruiterVerified && (
            <VerificationBadge type="recruiter" isDarkMode={isDarkMode} />
          )}
          {opp.companyVerified && (
            <VerificationBadge type="company" isDarkMode={isDarkMode} />
          )}
        </div>

        <div className="flex items-center gap-2">
          {onApply && (
            <button
              onClick={() => onApply(opp)}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95"
            >
              Apply
            </button>
          )}
          <a
            href={opp.applicationLink}
            target={opp.applicationLink.startsWith("http") ? "_blank" : undefined}
            rel={opp.applicationLink.startsWith("http") ? "noreferrer" : undefined}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 transition hover:text-indigo-700"
          >
            Details
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Posted date — subtle */}
      <p className="mt-2 text-[10px] font-semibold text-slate-400">
        Posted {opp.postedDate}
      </p>
    </div>
  );
}
