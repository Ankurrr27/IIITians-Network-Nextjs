"use client";

import type { IDiscussPost } from "@/types";
import { BadgeCheck, Check, ExternalLink, Trash2, X } from "lucide-react";

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
    <article className="ui-card ui-card-hover relative overflow-hidden">
      {/* ─── Mobile layout: stacked ─── */}
      <div className="md:hidden">
        <div className="relative h-36 w-full overflow-hidden bg-slate-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt={post.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
          {images.length > 1 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/70 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              +{images.length - 1} photos
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 p-3">
          {/* Meta row: college · club */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {post.collegeName}
            </span>
            {post.clubName && (
              <>
                <span className="text-[10px] text-slate-400">·</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-600">
                  {post.clubName}
                  {post.badgeLabel && <BadgeCheck className="h-3 w-3 fill-blue-500 text-white shrink-0" />}
                </span>
              </>
            )}
          </div>

          <h3 className="text-sm font-bold leading-snug text-slate-950 line-clamp-2">{post.title}</h3>
          <p className="text-[12px] font-medium leading-5 text-slate-600 line-clamp-3">{post.description}</p>

          {post.actionLink && (
            <a
              href={post.actionLink}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-indigo-700"
            >
              Open link <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* ─── Desktop layout: horizontal ─── */}
      <div className="hidden md:grid md:min-h-[11rem] md:grid-cols-[20rem_minmax(0,1fr)]">
        <a
          href={coverUrl}
          target="_blank"
          rel="noreferrer"
          className="relative block min-h-44 overflow-hidden bg-slate-950 lg:min-h-full"
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

        <div className="flex flex-col justify-center gap-2 p-4 sm:p-5">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {post.collegeName}
            </span>
            {post.clubName && (
              <>
                <span className="text-[10px] text-slate-400">·</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-600">
                  {post.clubName}
                  {post.badgeLabel && <BadgeCheck className="h-3.5 w-3.5 fill-blue-500 text-white shrink-0" />}
                </span>
              </>
            )}
          </div>

          <h3 className="text-lg font-extrabold leading-tight tracking-tight text-slate-950 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-[13px] font-medium leading-6 text-slate-600 line-clamp-3 whitespace-pre-wrap">
            {post.description.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
              const match = part.match(/\[(.*?)\]\((.*?)\)/);
              if (match) {
                return <a key={i} href={match[2]} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">{match[1]}</a>;
              }
              return <span key={i}>{part}</span>;
            })}
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            {post.actionLink && (
              <a
                href={post.actionLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-indigo-700"
              >
                Open link <ExternalLink className="h-3 w-3" />
              </a>
            )}

            {(onApprove || onReject || onDelete) && (
              <div className="flex items-center gap-1.5">
                {onApprove && post.status !== "approved" && (
                  <button
                    onClick={() => onApprove(post._id)}
                    className="rounded-full border border-slate-100 bg-slate-50 p-1.5 text-slate-500 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-600"
                    title="Approve Post"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                {onReject && post.status !== "rejected" && (
                  <button
                    onClick={() => onReject(post._id)}
                    className="rounded-full border border-slate-100 bg-slate-50 p-1.5 text-slate-500 shadow-sm transition hover:bg-amber-50 hover:text-amber-600"
                    title="Reject Post"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(post._id)}
                    className="rounded-full border border-rose-100 bg-rose-50 p-1.5 text-rose-500 shadow-sm transition hover:bg-rose-600 hover:text-white"
                    title="Delete Post"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
