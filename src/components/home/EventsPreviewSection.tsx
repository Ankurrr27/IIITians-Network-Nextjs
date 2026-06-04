"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient";
import type { IEvent } from "@/types";
import EventCard from "@/components/events/EventCard";

export default function EventsPreviewSection() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const LIMIT = 6;

  useEffect(() => {
    let mounted = true;
    api
      .get("/events")
      .then((res) => {
        if (!mounted) return;
        setEvents(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("EVENTS PREVIEW ERROR:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const latestEvents = events
    .filter((event) => event.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, LIMIT);

  return (
    <section className="bg-slate-50/50 py-12 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Latest <span className="text-indigo-600">Events</span>
            </h2>
          </div>

          <button
            onClick={() => router.push("/events")}
            className="shrink-0 rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            View all events
          </button>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: LIMIT }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : latestEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-slate-500">No events listed at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
