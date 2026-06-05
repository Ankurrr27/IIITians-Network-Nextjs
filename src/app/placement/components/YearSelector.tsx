"use client";

import { Calendar } from "lucide-react";

interface YearSelectorProps {
  years: number[];
  value: number | null;
  onChange: (y: number | null) => void;
}

export default function YearSelector({ years = [], value, onChange }: YearSelectorProps) {
  if (!years.length) return null;
  const sorted = [...years].sort((a, b) => b - a);
  const latest = sorted[0];

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
      <div className="flex items-center gap-1 px-3 text-slate-400">
        <Calendar size={16} />
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Year:</span>
      </div>
      <button
        onClick={() => onChange(latest)}
        className={`rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
          value === latest
            ? "bg-slate-950 text-white"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        {latest} (Latest)
      </button>
      {sorted.filter((y) => y !== latest).map((y) => (
        <button
          key={y}
          onClick={() => onChange(y)}
          className={`rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
            value === y
              ? "bg-slate-950 text-white"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {y}
        </button>
      ))}
      <button
        onClick={() => onChange(null)}
        className={`rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
          value === null
            ? "bg-slate-950 text-white"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        All Years
      </button>
    </div>
  );
}
