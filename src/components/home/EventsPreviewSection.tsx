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
  const LIMIT_DESKTOP = 6;
  const LIMIT_MOBILE = 3;

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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const mobileEvents = latestEvents.slice(0, LIMIT_MOBILE);
  const desktopEvents = latestEvents.slice(0, LIMIT_DESKTOP);

  return (
    <section className="bg-slate-50/50 py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Latest <span className="text-indigo-600">Events</span>
            </h2>
          </div>

          <button
            onClick={() => router.push("/events")}
            className="shrink-0 text-xs font-semibold text-indigo-500 hover:text-indigo-700 hover:underline transition cursor-pointer"
          >
            View all
          </button>
        </div>

        {loading ? (
          <>
            {/* Mobile skeleton */}
            <div className="divide-y divide-slate-200 sm:hidden">
              {Array.from({ length: LIMIT_MOBILE }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse bg-white" />
              ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden items-stretch gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: LIMIT_DESKTOP }).map((_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          </>
        ) : latestEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-slate-500">No events listed at the moment.</p>
          </div>
        ) : (
          <>
            {/* Mobile: cards feed with gaps */}
            <div className="flex flex-col gap-4 sm:hidden">
              {mobileEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
            {/* Desktop: grid */}
            <div className="hidden items-stretch gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {desktopEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

