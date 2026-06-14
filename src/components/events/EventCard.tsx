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
    <article className="ui-card ui-card-hover group flex h-full flex-col overflow-hidden">
      {/* Banner */}
      <div className="relative h-36 w-full flex-shrink-0 overflow-hidden border-b border-slate-100 bg-slate-50 sm:h-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bannerUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
        {event.type && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {event.type}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="max-w-[90%] text-base font-semibold leading-tight !text-white line-clamp-2">{event.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3">
        {/* Date + chips on one row */}
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
            <Calendar className="h-3 w-3" />
            {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
          {event.collegeName && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">·</span>
          )}
          {event.collegeName && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {event.collegeName}
            </span>
          )}
          {event.clubName && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">·</span>
          )}
          {event.clubName && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-sky-600">
              {event.clubName}
            </span>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-[12.5px] leading-5 text-slate-600 line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Action Panel */}
        <div className="mt-auto flex items-center justify-between pt-2.5">
          {event.link ? (
            <a
              href={event.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-indigo-700"
            >
              Open link <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ) : (
            <div />
          )}

          {/* Admin Tools */}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1.5">
              {onEdit && (
                <button
                  onClick={() => onEdit(event)}
                  className="ui-icon-button h-7 w-7"
                  title="Edit Event"
                >
                  <Pencil size={12} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(event._id)}
                  className="ui-icon-button h-7 w-7 border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  title="Delete Event"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

