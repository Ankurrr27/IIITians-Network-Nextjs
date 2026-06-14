"use client";

import React, { useState } from "react";
import {
  Github,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Mail,
} from "lucide-react";

const DiscordIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.27 4.73a16.14 16.14 0 0 0-3.8-1.2 11.23 11.23 0 0 0-.46.95 14.83 14.83 0 0 0-6 0 11.72 11.72 0 0 0-.47-.95 16.12 16.12 0 0 0-3.8 1.2 16.32 16.32 0 0 0-3.3 11.2 16.48 16.48 0 0 0 5 2.5 12.27 12.27 0 0 0 1.07-1.74 11.16 11.16 0 0 1-2.48-1.2c.2-.15.42-.3.61-.46a11.75 11.75 0 0 0 12.3 0c.19.16.4.3.61.46a11.17 11.17 0 0 1-2.48 1.2 12.06 12.06 0 0 0 1.07 1.74 16.43 16.43 0 0 0 5-2.5 16.29 16.29 0 0 0-3.26-11.2zm-10.1 8.87c-.96 0-1.74-.87-1.74-1.95s.76-1.95 1.74-1.95c.98 0 1.76.87 1.76 1.95s-.78 1.95-1.76 1.95zm5.66 0c-.96 0-1.74-.87-1.74-1.95s.76-1.95 1.74-1.95c.98 0 1.76.87 1.76 1.95s-.78 1.95-1.76 1.95z" />
  </svg>
);

const RedditIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.23-1.72l1.32-4.18 4.29 1c0 1.1.9 2 2 2 1.1 0 2-.9 2-2s-.9-2-2-2c-.76 0-1.43.43-1.77 1.07l-4.75-1.1c-.26-.06-.52.09-.6.35L10.3 8c-2.42.04-4.66.67-6.32 1.7-.56-.73-1.45-1.2-2.48-1.2-1.65 0-3 1.35-3 3 0 1.14.64 2.13 1.58 2.63-.05.29-.08.59-.08.9 0 3.86 4.7 7 10.5 7s10.5-3.14 10.5-7c0-.31-.03-.61-.08-.9.94-.5 1.58-1.49 1.58-2.63zm-16.5 2c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 4c-1.75 1.5-4.25 1.5-6 0-.18-.15-.2-.42-.05-.6.15-.18.42-.2.6-.05 1.42 1.2 3.88 1.2 5.3 0 .18-.15.45-.13.6.05.15.18.13.45-.05.6zm-.5-2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
  </svg>
);

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
    x?: string;
    youtube?: string;
    discord?: string;
    reddit?: string;
    email?: string;
    website?: string;
  };
}

const socialItems = [
  { key: "linkedin", icon: Linkedin, label: "LinkedIn", color: "text-[#0077b5]" },
  { key: "github", icon: Github, label: "GitHub", color: "text-slate-800" },
  { key: "instagram", icon: Instagram, label: "Instagram", color: "text-[#E1306C]" },
  { key: "twitter", icon: Twitter, label: "Twitter", color: "text-[#1DA1F2]" },
  { key: "x", icon: Twitter, label: "X", color: "text-slate-900" },
  { key: "youtube", icon: Youtube, label: "YouTube", color: "text-[#FF0000]" },
  { key: "discord", icon: DiscordIcon, label: "Discord", color: "text-[#5865F2]" },
  { key: "reddit", icon: RedditIcon, label: "Reddit", color: "text-[#FF4500]" },
  { key: "email", icon: Mail, label: "Email", color: "text-indigo-600" },
  { key: "website", icon: Globe, label: "Website", color: "text-indigo-600" },
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
    <article className="group overflow-hidden bg-white sm:rounded-[0.5rem] sm:border sm:border-slate-200 sm:shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:transition sm:duration-300 sm:hover:-translate-y-1 sm:hover:shadow-[0_20px_60px_rgba(79,70,229,0.08)]">
      <div className="flex flex-row sm:flex-col p-4 sm:p-0 gap-4 sm:gap-0 items-start sm:items-stretch">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full sm:h-64 sm:w-auto sm:rounded-none lg:h-72">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition duration-500 sm:group-hover:scale-[1.03]"
          />
          <div className="hidden sm:block absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent sm:h-36" />

          <div className="hidden sm:block absolute inset-x-0 bottom-0 p-5">
            <h3 className="text-xl font-semibold leading-tight !text-white">{name}</h3>
            <p className="mt-1 text-sm font-medium !text-white/85">
              {role} - {college}
            </p>
          </div>
        </div>

        <div className="flex-1 sm:p-5 flex flex-col justify-center min-w-0">
          <div className="sm:hidden mb-2">
            <h3 className="text-base font-semibold leading-tight text-slate-900 truncate">{name}</h3>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 truncate">
              {role} - {college}
            </p>
          </div>

          <p
            className={`text-xs leading-relaxed text-slate-600 sm:text-[15px] sm:leading-7 ${
              expanded ? "" : "line-clamp-3 sm:line-clamp-5"
            }`}
          >
            {desc}
          </p>

          {desc && desc.length > 80 && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-0.5 self-start text-[10px] font-semibold leading-none text-indigo-400 hover:text-indigo-600 hover:underline transition cursor-pointer"
            >
              {expanded ? "See less" : "See more"}
            </button>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
            {socialItems.map((item) => {
              const url = links[item.key as keyof typeof links];
              const IconComponent = item.icon;
              if (!url) return null;

              let href = url;
              if (item.key === "email" && url && !url.startsWith("mailto:")) {
                href = `mailto:${url}`;
              }

              return (
                <a
                  key={item.key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 ${item.color || 'text-slate-600'}`}
                  title={item.label}
                >
                  <IconComponent size={14} className="sm:w-[15px] sm:h-[15px]" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
