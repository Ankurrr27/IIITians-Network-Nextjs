"use client";

import { Search } from "lucide-react";

interface OpportunityFiltersProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  isDarkMode: boolean;
}

export default function OpportunityFilters({
  searchQuery,
  onSearchChange,
  isDarkMode,
}: OpportunityFiltersProps) {
  return (
    <div className="relative flex items-center w-full sm:max-w-xs">
      <Search size={16} className="absolute left-3 text-slate-400" />
      <input
        type="text"
        placeholder="Search opportunities..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`w-full rounded-xl border py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500"
            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
        }`}
      />
    </div>
  );
}
