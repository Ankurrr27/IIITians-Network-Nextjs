"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";

type PageHeaderProps = {
  title: ReactNode;
  description: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchControl?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
  controlsClassName?: string;
  searchWrapperClassName?: string;
  filtersClassName?: string;
};

export const pageHeaderControlClass =
  "h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100";

export const pageHeaderButtonClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-white hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100";

export default function PageHeader({
  title,
  description,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchControl,
  filters,
  actions,
  className = "",
  controlsClassName = "",
  searchWrapperClassName = "",
  filtersClassName = "",
}: PageHeaderProps) {
  const shouldRenderSearch = Boolean(searchControl || onSearchChange);

  return (
    <header className={`mb-8 text-left sm:mb-10 ${className}`}>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      {(shouldRenderSearch || filters || actions) && (
        <div className="mt-8 space-y-3">
          <div className={`grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start ${controlsClassName}`}>
            {shouldRenderSearch && (
              <div className={`min-w-0 ${searchWrapperClassName}`}>
                {searchControl || (
                  <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
                    <Search className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      type="text"
                      value={searchValue || ""}
                      onChange={(event) => onSearchChange?.(event.target.value)}
                      placeholder={searchPlaceholder}
                      className="h-full w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </label>
                )}
              </div>
            )}

            {filters && (
              <div className={`flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end ${filtersClassName}`}>
                {filters}
              </div>
            )}
          </div>

          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
      )}
    </header>
  );
}
