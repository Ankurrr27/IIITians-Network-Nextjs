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
    <article className="relative overflow-hidden rounded-[1.4rem] border border-sky-100 bg-white/95 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
      <div className="grid min-h-[12rem] md:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)]">
        <a
          href={coverUrl}
          target="_blank"
          rel="noreferrer"
          className="relative block min-h-48 overflow-hidden bg-slate-950 md:min-h-full"
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-indigo-700">
              <Megaphone className="h-3.5 w-3.5" />
              {post.type}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
              {post.collegeName}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
              {post.clubName}
            </span>
            {post.badgeLabel && (
              <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white">
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
  );
}
