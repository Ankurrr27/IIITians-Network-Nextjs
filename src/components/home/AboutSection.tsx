"use client";

import React, { useState } from "react";
import {
  Instagram,
  Linkedin,
  Globe,
  Youtube,
  Twitter,
  Mail,
} from "lucide-react";
import Initiatives from "./Initiatives";

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

export default function AboutSection() {
  return (
    <section className="bg-white py-10 sm:py-24 border-b border-slate-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-4 sm:px-6 sm:gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900  sm:text-4xl leading-tight">
  What is <span className="text-indigo-600">IIITians Network ?</span>
  <br />
</h2>
          </div>

          <div className="space-y-5 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-7">
            <p>
              IIITians Network is an autonomous, student-driven community that
              connects students and alumni across all Indian Institutes of
              Information Technology.
            </p>
            <p>
              Founded in January 2020 by students from IIIT Kota, IIIT Guwahati,
              and IIIT Gwalior, the initiative was built to solve a real
              problem: the lack of a unified, transparent, and student-first
              platform for IIITs.
            </p>
            <p>
              Over the years, IIITians Network has evolved into a nationwide
              ecosystem that supports collaboration, verified placement data,
              competitions, JEE aspirants, and alumni visibility.
            </p>
          </div>

          <div className="pt-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Connect with us
            </h4>
            <div className="flex gap-2 pt-3">
              <Social
                href="https://linkedin.com/company/iiitians-network"
                label="LinkedIn"
                className="border-blue-200 bg-blue-50/60 text-[#0077b5] hover:bg-blue-100"
              >
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </Social>
              <Social
                href="https://instagram.com/iiitiansnetwork"
                label="Instagram"
                className="border-pink-200 bg-pink-50/60 text-[#e1306c] hover:bg-pink-100"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </Social>
              <Social
                href="https://discord.gg/88AnpuNc6E"
                label="Discord"
                className="border-indigo-200 bg-indigo-50/60 text-[#5865f2] hover:bg-indigo-100"
              >
                <DiscordIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </Social>
              <Social
                href="https://x.com/iiitiansnetwork"
                label="X (Twitter)"
                className="border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </Social>
              <Social
                href="https://www.youtube.com/@iiitiansnetwork"
                label="YouTube"
                className="border-red-200 bg-red-50/60 text-[#ff0000] hover:bg-red-100"
              >
                <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
              </Social>
              <Social
                href="https://reddit.com/r/iiitiansnetwork"
                label="Reddit"
                className="border-orange-200 bg-orange-50/60 text-[#ff4500] hover:bg-orange-100"
              >
                <RedditIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </Social>
              <Social
                href="mailto:iiitiansnetwork@gmail.com"
                label="Email"
                className="border-indigo-200 bg-indigo-50/60 text-indigo-600 hover:bg-indigo-100"
              >
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              </Social>
            </div>
          </div>
        </div>

        <Initiatives />
      </div>
    </section>
  );
}

interface SocialProps {
  href: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}

function Social({ href, label, className = "", children }: SocialProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex shrink-0 h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border transition shadow-sm cursor-pointer ${className}`}
      title={label}
    >
      {children}
    </a>
  );
}
