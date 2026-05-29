import React from "react";
import { ShieldCheck, LucideIcon } from "lucide-react";
import Link from "next/link";

interface AdminHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: "indigo" | "emerald" | "rose" | "sky" | "amber" | "slate";
  backHref?: string;
  actions?: React.ReactNode;
  stats?: React.ReactNode;
}

const colorMap = {
  indigo: "bg-indigo-50 text-indigo-700",
  emerald: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  sky: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
};

export function AdminHeader({
  title,
  description,
  icon: Icon = ShieldCheck,
  badge,
  badgeColor = "indigo",
  backHref,
  actions,
  stats,
}: AdminHeaderProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {backHref && (
              <Link
                href={backHref}
                className="group flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
              >
                <svg
                  className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
            )}
            {badge && (
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${colorMap[badgeColor]}`}
              >
                <Icon className="h-3 w-3" />
                {badge}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm font-medium text-slate-500 max-w-3xl">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {stats && <div className="flex gap-3">{stats}</div>}
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
    </section>
  );
}

export function AdminStatCard({ label, value, color = "indigo" }: { label: string; value: string | number; color?: keyof typeof colorMap }) {
  return (
    <div className={`rounded-xl px-4 py-3 text-sm ${colorMap[color]}`}>
      <div className="font-semibold opacity-80">{label}</div>
      <div className="mt-0.5 text-xl font-bold sm:text-2xl">{value}</div>
    </div>
  );
}
