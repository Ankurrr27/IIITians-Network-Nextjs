"use client";
import { useState, useEffect } from "react";
import type { IEvent } from "@/types";
import { Calendar, ExternalLink, Search } from "lucide-react";
import { notifyPageEntry } from "@/utils/appNotifications";

interface Props {
  initialEvents: IEvent[];
}

const colleges = ["All", "IIIT Allahabad", "IIIT Hyderabad", "IIIT Delhi", "IIIT Bangalore", "IIIT Pune", "IIIT Gwalior"];

export default function EventsClient({ initialEvents }: Props) {
  const [search, setSearch] = useState("");
  const [college, setCollege] = useState("All");

  useEffect(() => {
    notifyPageEntry("Events page loaded", "Discover upcoming events across IIITs.", "page-events-loaded");
  }, []);

  const now = new Date();
  const upcoming = initialEvents.filter((e) => new Date(e.date) >= now);
  const past = initialEvents.filter((e) => new Date(e.date) < now);

  const filterEvents = (list: IEvent[]) =>
    list.filter((e) => {
      const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.collegeName.toLowerCase().includes(search.toLowerCase());
      const matchCollege = college === "All" || e.collegeName === college;
      return matchSearch && matchCollege;
    });

  return (
    <main className="relative min-h-screen bg-[linear-gradient(180deg,_#f0f9ff_0%,_#f9fcff_60%,_#f9fcff_100%)] pb-16 pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_30%_10%,rgba(99,102,241,0.12),transparent_22%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.10),transparent_22%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <header className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-500">Events Desk</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Campus <span className="text-indigo-600">Events</span>
          </h1>
          <p className="mt-3 text-base text-slate-500">
            {initialEvents.length} events across {new Set(initialEvents.map((e) => e.collegeName)).size} campuses
          </p>
        </header>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-9 pr-4 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <select
            value={college} onChange={(e) => setCollege(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Upcoming */}
        <EventSection title="Upcoming Events" events={filterEvents(upcoming)} accent="indigo" emptyMsg="No upcoming events found." />

        {/* Past */}
        <div className="mt-12">
          <EventSection title="Past Events" events={filterEvents(past)} accent="slate" emptyMsg="No past events found." />
        </div>
      </div>
    </main>
  );
}

function EventSection({ title, events, accent, emptyMsg }: { title: string; events: IEvent[]; accent: string; emptyMsg: string }) {
  return (
    <section>
      <h2 className={`mb-5 text-xl font-bold text-slate-800 ${accent === "indigo" ? "after:ml-2 after:content-['']" : ""}`}>{title}
        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-sm font-normal text-slate-500">{events.length}</span>
      </h2>
      {events.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">{emptyMsg}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <article key={event._id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              {event.banner?.url && (
                <div className="relative h-36 overflow-hidden bg-indigo-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={event.banner.url} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-500">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{event.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{event.collegeName}{event.clubName ? ` · ${event.clubName}` : ""}</p>
                {event.description && <p className="mt-2 text-xs text-slate-400 line-clamp-2">{event.description}</p>}
                {event.link && (
                  <a href={event.link} target="_blank" rel="noreferrer"
                    className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800">
                    Learn More <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
