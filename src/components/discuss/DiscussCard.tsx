"use client";
import React from "react";
import type { IDiscussPost } from "@/types";
import { Building2, BadgeCheck, Check, X, Trash2, ExternalLink } from "lucide-react";

interface DiscussCardProps {
  post: IDiscussPost;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function DiscussCard({ post, onApprove, onReject, onDelete }: DiscussCardProps) {
  const images = [
    ...(post.banner?.url ? [post.banner] : []),
    ...(post.photos || []),
  ].filter((image, index, list) => image?.url && list.findIndex((item) => item?.url === image.url) === index);

  return (
    <article
      className="
        relative rounded-[1.6rem] border border-sky-100 bg-white/95 shadow-sm overflow-hidden
        transition-all duration-300 hover:shadow-md hover:border-sky-200 hover:-translate-y-0.5
      "
    >
      {images.length > 0 && (
        <div className="grid gap-1 bg-slate-100 p-1 sm:grid-cols-2">
          {images.slice(0, 4).map((image, index) => (
            <a
              key={image.url}
              href={image.url}
              target="_blank"
              rel="noreferrer"
              className={`relative block overflow-hidden bg-slate-200 ${images.length === 1 ? "sm:col-span-2" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={`${post.title} photo ${index + 1}`}
                className="h-56 w-full object-cover transition duration-300 hover:scale-[1.02]"
              />
              {index === 3 && images.length > 4 && (
                <span className="absolute inset-0 flex items-center justify-center bg-slate-950/55 text-sm font-bold text-white">
                  +{images.length - 4} more
                </span>
              )}
            </a>
          ))}
        </div>
      )}

      <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Metadata Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">
              {post.type}
            </span>
            {post.badgeLabel && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <BadgeCheck className="h-3 w-3" />
                {post.badgeLabel}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              {post.collegeName}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              · {post.clubName}
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="text-base font-extrabold leading-snug text-slate-900 line-clamp-1">
            {post.title}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 font-semibold line-clamp-3">
            {post.description}
          </p>

          {post.actionLink && (
            <a
              href={post.actionLink}
              target="_blank"
              rel="noreferrer"
              className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 transition hover:underline"
            >
              View Link <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Action Panel (Status or Admin Buttons) */}
        <div className="flex shrink-0 items-center gap-3 border-t border-slate-50 pt-4 md:border-t-0 md:pt-0">
          {post.status && (
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                post.status === "approved"
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                  : post.status === "rejected"
                  ? "bg-rose-50 text-rose-600 ring-1 ring-rose-100"
                  : "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
              }`}
            >
              {post.status}
            </span>
          )}

          {/* Admin Action Buttons */}
          {(onApprove || onReject || onDelete) && (
            <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
              {onApprove && post.status !== "approved" && (
                <button
                  onClick={() => onApprove(post._id)}
                  className="rounded-full bg-slate-50 p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition shadow-sm border border-slate-100"
                  title="Approve Post"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              {onReject && post.status !== "rejected" && (
                <button
                  onClick={() => onReject(post._id)}
                  className="rounded-full bg-slate-50 p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition shadow-sm border border-slate-100"
                  title="Reject Post"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(post._id)}
                  className="rounded-full bg-rose-50 p-2 text-rose-500 hover:bg-rose-600 hover:text-white transition shadow-sm border border-rose-100"
                  title="Delete Post"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
