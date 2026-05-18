"use client";

import React, { useState } from "react";
import { Instagram, Linkedin, Globe, MessageCircle } from "lucide-react";
import Initiatives from "./Initiatives";

export default function AboutSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
            About The Network
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Built by students, shaped for the IIIT community
          </h2>

          <div className="mt-5 rounded-[1.75rem] bg-gradient-to-r from-indigo-50 to-blue-50 p-5 shadow-lg sm:p-10">
            <p
              className={`text-sm leading-7 text-slate-700 sm:text-lg sm:leading-8 ${
                expanded ? "" : "line-clamp-4 sm:line-clamp-none"
              }`}
            >
              IIITians Network is an autonomous, student-driven community that
              connects students and alumni across all Indian Institutes of
              Information Technology.
              <br />
              <br />
              Founded in January 2020 by students from IIIT Kota, IIIT Guwahati,
              and IIIT Gwalior, the initiative was built to solve a real
              problem: the lack of a unified, transparent, and student-first
              platform for IIITs.
              <br />
              <br />
              Over the years, IIITians Network has evolved into a nationwide
              ecosystem that supports collaboration, verified placement data,
              competitions, JEE aspirants, and alumni visibility.
            </p>

            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-3 text-sm font-medium text-indigo-600 transition hover:text-indigo-700 sm:hidden"
            >
              {expanded ? "Read less" : "Read more"}
            </button>

            <div className="mt-6 sm:mt-8">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 sm:text-sm">
                Connect with us
              </h4>

              <div className="mt-4 flex flex-wrap gap-3">
                <Social
                  href="https://www.instagram.com/iiitiansnetwork?igsh=MW4wY2d1Z211aGF2NA=="
                  label="Instagram"
                >
                  <Instagram size={16} />
                </Social>

                <Social
                  href="https://www.linkedin.com/company/iiitians-network/"
                  label="LinkedIn"
                >
                  <Linkedin size={16} />
                </Social>

                <Social
                  href="https://www.reddit.com/r/iiitiansnetwork_/s/raoRbgEdX6"
                  label="Reddit"
                >
                  <Globe size={16} />
                </Social>

                <Social href="https://discord.gg/88AnpuNc6E" label="Discord">
                  <MessageCircle size={16} />
                </Social>
              </div>
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
  children: React.ReactNode;
}

function Social({ href, label, children }: SocialProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
    >
      {children}
      {label}
    </a>
  );
}
