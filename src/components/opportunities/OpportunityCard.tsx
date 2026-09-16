"use client";

import { MapPin, Calendar, IndianRupee, ExternalLink, Laptop, Building2, MapPinned, Sparkles, ArrowUpRight } from "lucide-react";
import type { Opportunity } from "@/data/opportunities";
import VerificationBadge from "./VerificationBadge";

const workModeConfig: Record<string, { icon: React.ElementType; light: string; dark: string }> = {
  Remote: { icon: Laptop, light: "text-emerald-700 bg-emerald-50/80 border-emerald-200/60", dark: "text-emerald-400 bg-emerald-950/40 border-emerald-800/30" },
  Hybrid: { icon: MapPinned, light: "text-amber-700 bg-amber-50/80 border-amber-200/60", dark: "text-amber-400 bg-amber-950/40 border-amber-800/30" },
  Onsite: { icon: Building2, light: "text-blue-700 bg-blue-50/80 border-blue-200/60", dark: "text-blue-400 bg-blue-950/40 border-blue-800/30" },
};

interface OpportunityCardProps { opportunity: Opportunity; isDarkMode: boolean; onApply?: (opportunity: Opportunity) => void; }

const formatApplicationLink = (link: string) => {
  if (!link) return "";
  const trimmed = link.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("mailto:")) return trimmed;
  return trimmed.includes("@") ? `mailto:${trimmed}` : `https://${trimmed}`;
};

export default function OpportunityCard({ opportunity: opp, isDarkMode, onApply }: OpportunityCardProps) {
  const mode = workModeConfig[opp.workMode] || workModeConfig.Remote;
  const ModeIcon = mode.icon;
  const formattedLink = formatApplicationLink(opp.applicationLink);

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${opp.featured ? "ring-1 ring-amber-300/50" : ""} ${isDarkMode ? "border-slate-800 bg-slate-900/90 text-slate-100 hover:border-slate-600 hover:shadow-xl hover:shadow-black/25" : "border-slate-200 bg-white text-slate-900 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/12"}`}>
      {opp.featured && <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />}
      <div className="p-5 sm:p-6">
        {/* Title and company */}
        <h3 className={`text-xl font-extrabold leading-tight tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>{opp.title}</h3>
        <p className={`mt-1.5 text-sm font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{opp.company}<span className="mx-2 font-normal text-slate-400">&middot;</span><span className="font-normal">Posted {opp.postedDate}</span></p>

        {/* Category and work mode */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide ${isDarkMode ? "border-slate-700 bg-slate-800/80 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}>{opp.category}</span>
          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${isDarkMode ? "border-slate-700 bg-slate-800/80 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}><ModeIcon size={13} />{opp.workMode}</span>
          {opp.featured && <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${isDarkMode ? "border-amber-800/60 bg-amber-950/40 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-700"}`}><Sparkles size={13} className="text-amber-500" />Featured</span>}
        </div>

        {/* Description */}
        <p className={`mt-5 text-base leading-7 line-clamp-4 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{opp.description}</p>

        {/* Skills */}
        <div className="mt-5 flex flex-wrap gap-2">{opp.skills.slice(0, 4).map((skill) => <span key={skill} className={`inline-block rounded-lg border px-3 py-1.5 text-sm font-medium ${isDarkMode ? "border-slate-700 bg-slate-800/80 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}>{skill}</span>)}</div>

        {/* Location, compensation, and deadline */}
        <div className={`mt-5 space-y-2.5 text-base font-medium ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}>
          <span className="flex items-center gap-3"><MapPin size={18} className={isDarkMode ? "text-slate-400" : "text-slate-500"} />{opp.location}</span>
          <span className="flex items-center gap-3"><IndianRupee size={18} className={isDarkMode ? "text-emerald-400" : "text-emerald-600"} />{opp.compensation}</span>
          <span className="flex items-center gap-3"><Calendar size={18} className={isDarkMode ? "text-orange-400" : "text-orange-500"} />Deadline: {opp.deadline}</span>
        </div>
      </div>
      <div className={`border-t p-5 sm:p-6 ${isDarkMode ? "border-slate-800/80" : "border-slate-100"}`}>
        {/* Verification badges */}
        <div className="flex flex-wrap items-center gap-2">
          {opp.recruiterVerified && <VerificationBadge type="recruiter" isDarkMode={isDarkMode} className="px-3 py-1.5 text-sm" />}
          {opp.companyVerified && <VerificationBadge type="company" isDarkMode={isDarkMode} className="px-3 py-1.5 text-sm" />}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {formattedLink && <a href={formattedLink} target={formattedLink.startsWith("http") ? "_blank" : undefined} rel={formattedLink.startsWith("http") ? "noopener noreferrer" : undefined} className={`inline-flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${isDarkMode ? "border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white" : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}>Details<ExternalLink size={13} /></a>}
          {onApply && <button onClick={() => onApply(opp)} className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${isDarkMode ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500" : "bg-slate-900 text-white shadow-md shadow-slate-900/10 hover:bg-slate-800"}`}>Apply<ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></button>}
        </div>
      </div>
    </div>
  );
}
