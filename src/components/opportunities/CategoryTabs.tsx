"use client";

import {
  Briefcase,
  Building2,
  GraduationCap,
  Github,
  Trophy,
  Rocket,
  LayoutGrid,
} from "lucide-react";
import type { OpportunityCategory } from "@/data/opportunities";
import { CATEGORY_ALL, CATEGORIES } from "@/data/opportunities";

type TabValue = typeof CATEGORY_ALL | OpportunityCategory;

const iconMap: Record<string, React.ElementType> = {
  All: LayoutGrid,
  Internships: Briefcase,
  "Full-Time": Building2,
  Research: GraduationCap,
  "Open Source": Github,
  Hackathons: Trophy,
  Startups: Rocket,
};

interface CategoryTabsProps {
  active: TabValue;
  onChange: (tab: TabValue) => void;
  isDarkMode: boolean;
}

export default function CategoryTabs({ active, onChange, isDarkMode }: CategoryTabsProps) {
  const tabs: TabValue[] = [CATEGORY_ALL, ...CATEGORIES];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const Icon = iconMap[tab] || Briefcase;
        const isActive = active === tab;

        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-200 active:scale-95 ${
              isActive
                ? "bg-indigo-600 text-white shadow shadow-indigo-500/20"
                : isDarkMode
                  ? "border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{tab}</span>
          </button>
        );
      })}
    </div>
  );
}
