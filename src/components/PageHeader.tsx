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
  "ui-control h-11 px-3.5 text-slate-700 placeholder:text-slate-400";

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

  return (
    <header className={`mb-6 text-left sm:mb-8 ${className}`}>
      <div className="max-w-3xl">
        <h1 className="ui-title">
          {renderTitle(title)}
        </h1>
        <p className="ui-subtitle mt-3">
          {description}
        </p>
      </div>

      {(shouldRenderSearch || filters || actions) && (
        <div className="mt-5 space-y-3">
          <div className={`grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start ${controlsClassName}`}>
            {shouldRenderSearch && (
              <div className={`min-w-0 ${searchWrapperClassName}`}>
                {searchControl || (
                  <label className="ui-control flex h-11 items-center gap-3 px-3.5">
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
