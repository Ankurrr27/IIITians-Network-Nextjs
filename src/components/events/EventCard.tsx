"use client";
import React from "react";
import type { IEvent } from "@/types";
import { Calendar, ExternalLink, Pencil, Trash2 } from "lucide-react";

interface EventCardProps {
  event: IEvent;
  onEdit?: (event: IEvent) => void;
  onDelete?: (id: string) => void;
}

const FALLBACK_BANNER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2394a3b8'>No Event Banner</text></svg>";

export default function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const bannerUrl = event.banner?.url || FALLBACK_BANNER;

  return (
    <article className="ui-card ui-card-hover group flex h-full flex-col">
      {/* Event Banner - Fixed Height */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-50 border-b border-slate-100 flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bannerUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
        {event.type && (
          <span className="absolute left-4 top-4 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {event.type}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="max-w-[90%] text-lg font-semibold leading-tight line-clamp-2">{event.title}</h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(event.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </div>

        <div className="mb-2 flex flex-wrap gap-2">
          {event.collegeName && (
            <span className="ui-chip border-indigo-100 bg-indigo-50 text-indigo-700">
              {event.collegeName}
            </span>
          )}
          {event.clubName && (
            <span className="ui-chip border-sky-100 bg-sky-50 text-sky-700">
              {event.clubName}
            </span>
          )}
        </div>

        {event.description && (
          <p className="min-h-[3rem] text-sm leading-6 text-slate-600 line-clamp-2">
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
