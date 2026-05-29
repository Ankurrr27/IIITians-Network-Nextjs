"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { ICollege } from "@/types";
import { Building2, Images, Users, Link2, ExternalLink } from "lucide-react";

interface CollegeCardProps {
  college: ICollege;
  memberCount?: number;
  alumniCount?: number;
  clubCount?: number;
  onRecentSearchClick?: (name: string) => void;
}

const FALLBACK_COVER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2394a3b8'>No Image</text></svg>";

export default function CollegeCard({
  college,
  memberCount = 0,
  alumniCount = 0,
  clubCount = 0,
  onRecentSearchClick,
}: CollegeCardProps) {
  const coverUrl = college.photo?.url || FALLBACK_COVER;
  const logoUrl = college.logo?.url;

  const handleClick = () => {
    if (onRecentSearchClick) {
      onRecentSearchClick(college.name);
    }
  };

  return (
    <article
      onClick={handleClick}
      className="group flex flex-col overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >
      {/* Cover Photo */}
      <div className="relative h-40 shrink-0 overflow-hidden border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-blue-100">
        {college.photo?.url ? (
          <Image
            src={coverUrl}
            alt={college.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-extrabold text-indigo-200 uppercase tracking-widest bg-indigo-50/50">
            {college.name[0]}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-3">
          {/* Logo Mark */}
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white shadow ring-1 ring-slate-100 flex items-center justify-center">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${college.name} logo`}
                fill
                className="object-contain p-1.5"
                sizes="44px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-black text-indigo-600 uppercase">
                {college.name[0]}
              </div>
            )}
          </div>
          <h2 className="text-sm font-extrabold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
            {college.name}
          </h2>
        </div>

        {college.description && (
          <p className="mt-3 text-xs leading-relaxed text-slate-500 font-semibold line-clamp-2">
            {college.description}
          </p>
        )}

        {/* Metrics Pill Grid */}
        <div className="mt-3.5 flex flex-wrap gap-1.5 text-[10px] font-bold uppercase tracking-wider">
          {memberCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-indigo-600 ring-1 ring-indigo-100">
              <Users className="h-3 w-3" />
              {memberCount} Members
            </span>
          )}
          {alumniCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-600 ring-1 ring-emerald-100">
              <Users className="h-3 w-3" />
              {alumniCount} Alumni
            </span>
          )}
          {clubCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-rose-600 ring-1 ring-rose-100">
              <Building2 className="h-3 w-3" />
              {clubCount} Clubs
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex flex-wrap gap-2 pt-5 border-t border-slate-50">
          {college.website && (
            <a
              href={college.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
            >
              Website <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {college.gallery && college.gallery.length > 0 && (
            <Link
              href={`/college/${encodeURIComponent(college.name)}/gallery`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
            >
              Gallery <Images className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
