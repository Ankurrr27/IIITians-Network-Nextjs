"use client";

import { useEffect, useMemo, useState } from "react";
import type { IEvent } from "@/types";
import EventCard from "@/components/events/EventCard";
import PageHeader, { pageHeaderControlClass } from "@/components/PageHeader";
import { notifyPageEntry } from "@/utils/appNotifications";

interface Props {
  initialEvents: IEvent[];
}

const ITEMS_PER_PAGE = 15;

export default function EventsClient({ initialEvents }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    notifyPageEntry("Events page loaded", "Discover upcoming events across IIITs.", "page-events-loaded");
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = initialEvents.filter((event) => {
      if (!query) return true;
      return (
        event.title.toLowerCase().includes(query) ||
        (event.collegeName || "").toLowerCase().includes(query) ||
        (event.clubName || "").toLowerCase().includes(query)
      );
    });

    return [...matches].sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "za") return b.title.localeCompare(a.title);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [initialEvents, search, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <section className="ui-page-bg relative min-h-screen pb-10 pt-24 sm:pb-12 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />

      <div className="ui-page-shell relative z-10">
        <PageHeader
          title=""
          description=""
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search events, colleges, clubs..."
          filters={
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className={`${pageHeaderControlClass} w-full sm:w-52`}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">Title A-Z</option>
              <option value="za">Title Z-A</option>
            </select>
          }
          actions={
            <a
              href="/discuss?clubAccount=true"
              className="ui-button ui-button-primary inline-flex h-11 shrink-0 items-center justify-center gap-1.5 px-4 text-sm font-bold tracking-wide w-full sm:w-auto"
            >
              Add Your Event
            </a>
          }
        />

        <EventsGrid events={paginated} />

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="ui-button ui-button-ghost inline-flex min-h-10 items-center px-4 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <div className="ui-chip">
              Page <span className="font-bold text-slate-900">{currentPage}</span> of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="ui-button ui-button-ghost inline-flex min-h-10 items-center px-4 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function EventsGrid({ events }: { events: IEvent[] }) {
  if (events.length === 0) {
    return <div className="ui-empty text-sm font-semibold">No matching events found.</div>;
  }

  return (
    <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}
