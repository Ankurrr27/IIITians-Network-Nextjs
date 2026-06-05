"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { IEvent } from "@/types";
import {
  ArrowUpRight, BookOpenText, CalendarDays, Sparkles,
  ArrowRight, ExternalLink, MapPin, Users,
} from "lucide-react";
import { notifyPageEntry } from "@/utils/appNotifications";
import PageHeader, { pageHeaderControlClass } from "@/components/PageHeader";

interface Props {
  initialEvents: IEvent[];
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function EventsClient({ initialEvents }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    notifyPageEntry("Events page loaded", "Discover upcoming events across IIITs.", "page-events-loaded");
  }, []);

  // Reset to page 1 on search/sort change
  useEffect(() => { setCurrentPage(1); }, [search, sortBy]);

  // Filter
  let filtered = initialEvents.filter((e) =>
    !search ||
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.collegeName || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.clubName || "").toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  if (sortBy === "newest") filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (sortBy === "oldest") filtered = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (sortBy === "az") filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  if (sortBy === "za") filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title));

  // Paginate
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section className="relative min-h-screen bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)] pb-14 pt-20 sm:pb-16 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">

        <PageHeader
          title="Explore the latest network events."
          description="Discover cultural festivals, club launches, collaborations, and verified event pushes from IIIT communities across the network."
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search events, colleges, clubs..."
          filters={
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`${pageHeaderControlClass} w-full sm:w-56`}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">Title A-Z</option>
              <option value="za">Title Z-A</option>
            </select>
          }
        />

        {/* Grid */}
        <EventsGrid loading={false} events={paginated} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
            >
              Previous
            </button>
            <div className="text-sm font-medium text-slate-400">
              Page <span className="text-slate-900 font-bold">{currentPage}</span> of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── EventsGrid ─────────────────────────────────────────────────────────── */
function EventsGrid({ loading, events }: { loading: boolean; events: IEvent[] }) {
  if (loading) {
    return (
      <div className="grid items-stretch gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
            <div className="h-56 bg-slate-200" />
            <div className="space-y-4 p-5">
              <div className="flex gap-2">
                <div className="h-8 w-24 rounded-full bg-slate-200" />
                <div className="h-8 w-20 rounded-full bg-slate-100" />
              </div>
              <div className="h-7 w-3/4 rounded-xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-5/6 rounded bg-slate-100" />
                <div className="h-4 w-2/3 rounded bg-slate-100" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-12 flex-1 rounded-full bg-slate-200" />
                <div className="h-12 w-12 rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="text-gray-500">No matching events found.</p>;
  }

  return (
    <div className="grid items-stretch gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}

/* ─── EventCard ──────────────────────────────────────────────────────────── */
function EventCard({ event }: { event: IEvent }) {
  const [expanded, setExpanded] = useState(false);
  const { title, description, date, banner, collegeName, clubName, link } = event;

  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="h-full w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,70,229,0.14)]">
      {/* Mobile layout */}
      <div className="sm:hidden">
        <div className="relative h-44 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner?.url || "/placeholder.svg"} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur">
              <CalendarDays size={12} />
              {formattedDate}
            </div>
            <h3 className="mt-3 text-lg font-semibold leading-tight">{title}</h3>
          </div>
        </div>

        <div className="flex min-h-[15rem] flex-col p-4">
          <div className="mb-3 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 font-medium text-indigo-700">
              <MapPin size={13} />{collegeName || "College"}
            </span>
            {clubName && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 font-medium text-sky-700">
                <Users size={13} />{clubName}
              </span>
            )}
          </div>
          <p className={`min-h-[4.5rem] text-sm leading-6 text-slate-600 transition-all duration-300 ${expanded ? "" : "line-clamp-3"}`}>
            {description || "No description provided."}
          </p>
          <div className="mt-auto flex items-center gap-2 pt-4">
            <button
              onClick={() => setExpanded((p) => !p)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              {expanded ? "Show less" : "View details"}
              <ArrowRight size={14} />
            </button>
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-indigo-200 text-indigo-600 transition hover:bg-indigo-50">
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="relative hidden h-full sm:block">
        <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(79,70,229,0.12)]">
          <div className="relative h-[17rem] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner?.url || "/placeholder.svg"} alt={title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
            <div className="absolute left-5 top-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/16 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                <CalendarDays size={13} />{formattedDate}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h3 className="max-w-[80%] text-[1.95rem] font-semibold leading-tight">{title}</h3>
            </div>
          </div>

          <div className="flex min-h-[15.75rem] flex-col px-5 pb-5 pt-4">
            <div className="mb-3 flex flex-wrap gap-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 font-medium text-indigo-700">
                <MapPin size={13} />{collegeName || "College"}
              </span>
              {clubName && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 font-medium text-sky-700">
                  <Users size={13} />{clubName}
                </span>
              )}
            </div>
            <p className={`min-h-[6.5rem] text-[15px] leading-7 text-slate-600 ${expanded ? "" : "line-clamp-3"}`}>
              {description || "No description provided."}
            </p>
            <div className="mt-auto flex items-center gap-3 pt-5">
              <button
                onClick={() => setExpanded((p) => !p)}
                className="min-w-[11rem] flex-1 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                {expanded ? "Hide details" : "View details"}
              </button>
              {link && (
                <a href={link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-indigo-200 text-indigo-600 transition hover:bg-indigo-50">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
