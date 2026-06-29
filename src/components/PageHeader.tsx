"use client";

import type { ReactNode } from "react";
import { Search, MoreHorizontal, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
  "ui-control h-11 px-3.5 py-0 text-slate-700 placeholder:text-slate-400";

export const pageHeaderButtonClass =
  "ui-button ui-button-ghost inline-flex h-11 items-center justify-center gap-2 px-3.5";

function renderTitle(title: ReactNode) {
  if (typeof title !== "string") return title;

  const words = title.trim().split(/\s+/);
  if (words.length < 2) return title;

  const accent = words.pop();
  return (
    <span className="ui-heading-row">
      <span>{words.join(" ")}</span>
      <span className="ui-title-accent">{accent}</span>
    </span>
  );
}

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!filtersOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filtersOpen]);

  const hasTitle = Boolean(title || description);

  return (
    <header className={`${hasTitle ? "mb-6 sm:mb-8" : "mb-6 sm:mb-8"} text-left ${className}`}>
      {(title || description) && (
        <div className="max-w-3xl">
          <h1 className="ui-title">{renderTitle(title)}</h1>
          <p className="ui-subtitle mt-3">{description}</p>
        </div>
      )}

      {(shouldRenderSearch || filters || actions) && (
        <div className={hasTitle ? "mt-5 space-y-3" : "space-y-3"}>

          {/* ── Mobile: search + ⋯ in one row ── */}
          {(shouldRenderSearch || filters) && (
            <div className="sm:hidden" ref={filterRef}>
              <div className="flex items-center gap-2 group/header">
                {/* Search */}
                <div className="min-w-0 flex-1">
                  {searchControl || (
                    <label className="ui-control flex h-11 items-center gap-3 px-3.5 py-0">
                      <Search className="h-4 w-4 shrink-0 text-slate-400" />
                      <input
                        type="text"
                        value={searchValue || ""}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-full w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 py-0"
                      />
                    </label>
                  )}
                </div>

                {/* Three-dot filter toggle */}
                {filters && (
                  <button
                    onClick={() => setFiltersOpen((v) => !v)}
                    className={`ui-control flex h-11 w-11 shrink-0 items-center justify-center p-0 transition group-focus-within/header:hidden ${
                      filtersOpen
                        ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    aria-label="Toggle filters"
                  >
                    {filtersOpen ? (
                      <X className="h-4 w-4" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </button>
                )}

                {/* Actions inline on mobile */}
                {actions && <div className="shrink-0 group-focus-within/header:hidden transition-all">{actions}</div>}
              </div>

              {/* Filter panel — slides open below */}
              {filtersOpen && filters && (
                <div className={`mt-2 flex flex-col gap-2 ${filtersClassName}`}>
                  {filters}
                </div>
              )}
            </div>
          )}

          {/* ── Desktop: original grid layout ── */}
          <div className={`hidden sm:grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start ${controlsClassName}`}>
            {shouldRenderSearch && (
              <div className={`min-w-0 ${searchWrapperClassName}`}>
                {searchControl || (
                  <label className="ui-control flex h-11 items-center gap-3 px-3.5 py-0">
                    <Search className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      type="text"
                      value={searchValue || ""}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      placeholder={searchPlaceholder}
                      className="h-full w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 py-0"
                    />
                  </label>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              {filters && (
                <div className={`flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end ${filtersClassName}`}>
                  {filters}
                </div>
              )}
              {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
