"use client";
import React from "react";
import type { IEvent } from "@/types";
import { Calendar, ExternalLink, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

interface EventCardProps {
  event: IEvent;
  onEdit?: (event: IEvent) => void;
  onDelete?: (id: string) => void;
}

const FALLBACK_BANNER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2394a3b8'>No Event Banner</text></svg>";

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const bannerUrl = event.banner?.url || FALLBACK_BANNER;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-150">
      {/* Event Banner */}
      <div className="relative h-44 overflow-hidden bg-slate-50 border-b border-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bannerUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        {event.type && (
          <span className="absolute left-4 top-4 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {event.type}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(event.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>

        <h3 className="text-base font-extrabold leading-snug text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h3>

        <p className="mt-1 text-xs font-semibold text-slate-500">
          {event.collegeName}
          {event.clubName ? ` · ${event.clubName}` : ""}
        </p>

        {event.description && (
          <p className="mt-3 text-xs leading-relaxed text-slate-600 font-semibold line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Action Panel */}
        <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
          {event.link ? (
            <a
              href={event.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 transition hover:text-indigo-800"
            >
              Learn More <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <div className="h-4" />
          )}

          {/* Admin Tools */}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(event)}
                  className="rounded-full bg-slate-50 p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition shadow-sm border border-slate-100"
                  title="Edit Event"
                >
                  <Pencil size={13} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(event._id)}
                  className="rounded-full bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition shadow-sm border border-rose-100"
                  title="Delete Event"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
