import React from "react";
import type { LucideIcon } from "lucide-react";

export type AdminSectionTab<T extends string = string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
};

export function AdminSectionTabs<T extends string>({
  tabs,
  active,
  onChange,
  className = "",
}: {
  tabs: AdminSectionTab<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={`mb-4 overflow-x-auto custom-scrollbar ${className}`}>
      <div className="inline-flex min-w-max gap-1 rounded-xl border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {tab.label}
              {typeof tab.count === "number" && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
