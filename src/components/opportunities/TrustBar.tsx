"use client";

import { Building2, Briefcase, Users, Globe } from "lucide-react";

interface TrustBarProps {
  isDarkMode: boolean;
}

const stats = [
  { icon: Building2, value: "25+", label: "IIITs Connected" },
  { icon: Briefcase, value: "18", label: "Verified Opportunities" },
  { icon: Users, value: "10,000+", label: "Students Reached" },
  { icon: Globe, value: "1", label: "Unified Platform" },
];

export default function TrustBar({ isDarkMode }: TrustBarProps) {
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 shadow-sm transition-colors duration-300 ${
        isDarkMode
          ? "border-slate-800 bg-slate-900/60"
          : "border-slate-200 bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-2">
              <Icon
                size={15}
                className={isDarkMode ? "text-indigo-400" : "text-indigo-600"}
              />
              <span
                className={`text-sm font-extrabold ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {stat.value}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDarkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
