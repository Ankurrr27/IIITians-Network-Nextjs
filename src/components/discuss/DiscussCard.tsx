"use client";

import type { IDiscussPost } from "@/types";
import { BadgeCheck, Check, ExternalLink, Megaphone, Trash2, X } from "lucide-react";

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
  const coverUrl = images[0]?.url || "/IIITians-Network-Logo-Dark.png";

  return (
    <>
      {/* Mobile Layout */}
      <article className="ui-card ui-card-hover relative md:hidden">
        <div className="flex flex-col">
          {/* Small Banner */}
          <div className="relative h-32 overflow-hidden bg-slate-950">
            <img
              src={coverUrl}
              alt={post.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
          </div>

          {/* Compact Content */}
          <div className="flex flex-col gap-2 p-3">
            <div className="flex flex-wrap items-center gap-1">
              <span className="ui-chip border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[9px] uppercase text-indigo-700">
                <Megaphone className="h-2.5 w-2.5" />
                {post.type}
              </span>
              <span className="ui-chip px-2 py-0.5 text-[8px] uppercase">
                {post.collegeName}
              </span>
              {post.badgeLabel && (
                <span className="ui-chip border-indigo-600 bg-indigo-600 px-2 py-0.5 text-[8px] uppercase text-white">
                  <BadgeCheck className="h-2 w-2" />
                  Verified
                </span>
              )}
            </div>

            <h3 className="text-sm font-bold leading-snug text-slate-950 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-xs font-medium leading-5 text-slate-600 line-clamp-2">
              {post.description}
            </p>

            {post.actionLink && (
              <a
                href={post.actionLink}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Open link <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </article>

      {/* Desktop Layout */}
      <article className="ui-card ui-card-hover relative hidden md:block">
        <div className="grid min-h-[12rem] lg:grid-cols-[16rem_minmax(0,1fr)]">
          <a
            href={coverUrl}
            target="_blank"
            rel="noreferrer"
            className="relative block min-h-48 overflow-hidden bg-slate-950 lg:min-h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={post.title}
              className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
            />
            {images.length > 1 && (
              <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                +{images.length - 1} photos
              </span>
            )}
          </a>

          <div className="flex flex-col justify-center gap-4 p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="ui-chip border-indigo-100 bg-indigo-50 text-[11px] uppercase text-indigo-700">
                <Megaphone className="h-3.5 w-3.5" />
                {post.type}
              </span>
              <span className="ui-chip text-[11px] uppercase">
                {post.collegeName}
              </span>
              <span className="ui-chip text-[11px] uppercase">
                {post.clubName}
              </span>
              {post.badgeLabel && (
                <span className="ui-chip border-indigo-600 bg-indigo-600 text-[11px] uppercase text-white">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>

            <h3 className="text-xl font-extrabold leading-tight tracking-tight text-slate-950">
              {post.title}
            </h3>
            <p className="text-sm font-medium leading-7 text-slate-700 whitespace-pre-wrap">
              {post.description.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
                const match = part.match(/\[(.*?)\]\((.*?)\)/);
                if (match) {
                  return <a key={i} href={match[2]} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">{match[1]}</a>;
                }
                return <span key={i}>{part}</span>;
              })}
            </p>

            {post.actionLink && (
              <a
                href={post.actionLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Open link <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {(onApprove || onReject || onDelete) && (
              <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
                {onApprove && post.status !== "approved" && (
                  <button
                    onClick={() => onApprove(post._id)}
                    className="rounded-full border border-slate-100 bg-slate-50 p-2 text-slate-500 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-600"
                    title="Approve Post"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                {onReject && post.status !== "rejected" && (
                  <button
                    onClick={() => onReject(post._id)}
                    className="rounded-full border border-slate-100 bg-slate-50 p-2 text-slate-500 shadow-sm transition hover:bg-amber-50 hover:text-amber-600"
                    title="Reject Post"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(post._id)}
                    className="rounded-full border border-rose-100 bg-rose-50 p-2 text-rose-500 shadow-sm transition hover:bg-rose-600 hover:text-white"
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
    </>
  );
}
