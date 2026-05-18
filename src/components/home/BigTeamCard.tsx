"use client";

import React, { useState } from "react";
import { Github, Globe, Instagram, Linkedin, Twitter } from "lucide-react";

interface BigTeamCardProps {
  name: string;
  role: string;
  college: string;
  image: string;
  desc: string;
  links?: {
    linkedin?: string;
    github?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

const socialItems = [
  { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
  { key: "github", icon: Github, label: "GitHub" },
  { key: "instagram", icon: Instagram, label: "Instagram" },
  { key: "twitter", icon: Twitter, label: "Twitter" },
  { key: "website", icon: Globe, label: "Website" },
] as const;

export default function BigTeamCard({
  name,
  role,
  college,
  image,
  desc,
  links = {},
}: BigTeamCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="group overflow-hidden rounded-[1.45rem] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(79,70,229,0.12)] sm:rounded-[1.9rem]">
      <div className="flex flex-col">
        <div className="relative h-52 overflow-hidden bg-indigo-50 sm:h-64 lg:h-72">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/55 via-slate-950/15 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-3.5 sm:hidden">
            <h3 className="text-base font-semibold leading-tight text-white">{name}</h3>
            <p className="mt-1 text-[11px] font-medium text-white/85">
              {role} - {college}
            </p>
          </div>
        </div>

        <div className="p-3.5 sm:p-5">
          <div className="hidden sm:block">
            <h3 className="text-2xl font-semibold leading-tight text-slate-900">{name}</h3>
            <p className="mt-1 text-sm font-medium leading-5 text-indigo-600">
              {role} - {college}
            </p>
          </div>

          <p
            className={`text-[13px] leading-6 text-slate-600 sm:mt-4 sm:text-[15px] sm:leading-7 ${
              expanded ? "" : "line-clamp-5"
            }`}
          >
            {desc}
          </p>

          {desc && desc.length > 80 && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
            >
              {expanded ? "See less" : "See more"}
            </button>
          )}

          <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
            {socialItems.map((item) => {
              const url = links[item.key as keyof typeof links];
              const IconComponent = item.icon;
              return url ? (
                <a
                  key={item.key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:text-sm"
                >
                  <IconComponent size={14} />
                  <span>{item.label}</span>
                </a>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
