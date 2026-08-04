"use client";

import {
  MapPin,
  Calendar,
  IndianRupee,
  ExternalLink,
  Laptop,
  Building2,
  MapPinned,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import VerificationBadge from "./VerificationBadge";

const workModeConfig: Record<string, { icon: React.ElementType; light: string; dark: string }> = {
  Remote: { icon: Laptop, light: "text-emerald-700 bg-emerald-50/80 border-emerald-200/60", dark: "text-emerald-400 bg-emerald-950/40 border-emerald-800/30" },
  Hybrid: { icon: MapPinned, light: "text-amber-700 bg-amber-50/80 border-amber-200/60", dark: "text-amber-400 bg-amber-950/40 border-amber-800/30" },
  Onsite: { icon: Building2, light: "text-blue-700 bg-blue-50/80 border-blue-200/60", dark: "text-blue-400 bg-blue-950/40 border-blue-800/30" },
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  isDarkMode: boolean;
  onApply?: (opportunity: Opportunity) => void;
}

const formatApplicationLink = (link: string) => {
  if (!link) return "";
  const trimmed = link.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("mailto:")) {
    return trimmed;
  }
  if (trimmed.includes("@") && !trimmed.startsWith("mailto:")) {
    return `mailto:${trimmed}`;
  }
  return `https://${trimmed}`;
};

const categoryColors: Record<string, { bg: string; text: string; border: string; darkBg: string; darkText: string; darkBorder: string }> = {
  Internships: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200/60", darkBg: "bg-violet-950/40", darkText: "text-violet-400", darkBorder: "border-violet-800/30" },
  "Full-Time": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200/60", darkBg: "bg-sky-950/40", darkText: "text-sky-400", darkBorder: "border-sky-800/30" },
  Research: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200/60", darkBg: "bg-teal-950/40", darkText: "text-teal-400", darkBorder: "border-teal-800/30" },
  "Open Source": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200/60", darkBg: "bg-indigo-950/40", darkText: "text-indigo-400", darkBorder: "border-indigo-800/30" },
  Hackathons: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200/60", darkBg: "bg-rose-950/40", darkText: "text-rose-400", darkBorder: "border-rose-800/30" },
  Startups: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200/60", darkBg: "bg-orange-950/40", darkText: "text-orange-400", darkBorder: "border-orange-800/30" },
};

export default function OpportunityCard({ opportunity, isDarkMode, onApply }: OpportunityCardProps) {
  const opp = opportunity;
  const mode = workModeConfig[opp.workMode] || workModeConfig.Remote;
  const ModeIcon = mode.icon;
  const formattedLink = formatApplicationLink(opp.applicationLink);
  const catColor = categoryColors[opp.category] || categoryColors.Internships;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden ${
        opp.featured ? "ring-1 ring-amber-300/50" : ""
      } ${
        isDarkMode
          ? "border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-900/40 text-slate-100 hover:border-slate-600 hover:shadow-lg hover:shadow-indigo-500/5"
          : "border-slate-200/80 bg-white text-slate-900 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/8"
      }`}
    >
      {/* Featured accent stripe */}
      {opp.featured && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
      )}

      <div className="p-5 pb-0">
        {/* Header — category + work mode + featured */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                isDarkMode
                  ? `${catColor.darkBg} ${catColor.darkText} ${catColor.darkBorder}`
                  : `${catColor.bg} ${catColor.text} ${catColor.border}`
              }`}
            >
              {opp.category}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold ${
                isDarkMode ? mode.dark : mode.light
              }`}
            >
              <ModeIcon size={11} />
              {opp.workMode}
            </span>
          </div>

          {opp.featured && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-amber-700">
              <Sparkles size={10} className="text-amber-500" />
              Featured
            </span>
          )}
        </div>

        {/* Title + Company */}
        <div className="mt-4">
          <h3
            className={`text-[15px] font-extrabold leading-tight tracking-tight ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            {opp.title}
          </h3>
          <p className={`mt-1 text-xs font-semibold tracking-wide ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
            {opp.company}
          </p>
        </div>

        {/* Description */}
        <p
          className={`mt-3 text-[13px] leading-relaxed line-clamp-2 ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {opp.description}
        </p>

        {/* Skills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {opp.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                isDarkMode
                  ? "bg-slate-800/80 text-slate-300 border border-slate-700/50"
                  : "bg-slate-50 text-slate-600 border border-slate-100"
              }`}
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Meta row */}
        <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} className="shrink-0" />
            {opp.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <IndianRupee size={11} className="shrink-0" />
            {opp.compensation}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={11} className="shrink-0" />
            {opp.deadline}
          </span>
        </div>
      </div>

      {/* Bottom — verification + action */}
      <div className="p-5 pt-4 mt-3">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-t pt-4 ${
            isDarkMode ? "border-slate-800/80" : "border-slate-100"
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
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[11px] font-bold transition-all duration-200 active:scale-95 ${
                  isDarkMode
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30"
                    : "bg-slate-900 text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/15"
                }`}
              >
                Apply
                <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            )}
            {formattedLink && (
              <a
                href={formattedLink}
                target={formattedLink.startsWith("http") ? "_blank" : undefined}
                rel={formattedLink.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[11px] font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                  isDarkMode
                    ? "border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                Details
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>

        {/* Posted date */}
        <p className={`mt-3 text-[10px] font-medium ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}>
          Posted {opp.postedDate}
        </p>
      </div>
    </div>
  );
}
