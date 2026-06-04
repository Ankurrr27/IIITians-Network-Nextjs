"use client";

import React, { useState } from "react";
import { Instagram, Linkedin, Globe, MessageCircle } from "lucide-react";
import Initiatives from "./Initiatives";

export default function AboutSection() {
  return (
    <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl leading-tight">
              Built by students, <br></br>
              shaped for the IIIT community.
            </h2>
          </div>

          <div className="space-y-5 text-base leading-7 text-slate-600 sm:text-[1.05rem] sm:leading-8">
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
            <div className="flex flex-wrap gap-2.5 pt-3">
              <Social 
                href="https://linkedin.com/company/iiitians-network" 
                label="LinkedIn"
                className="hover:border-blue-200 hover:bg-blue-50/50 hover:text-[#0077b5]"
              >
                <Linkedin className="h-4 w-4 text-[#0077b5]" />
              </Social>
              <Social 
                href="https://instagram.com/iiitiansnetwork" 
                label="Instagram"
                className="hover:border-pink-200 hover:bg-pink-50/50 hover:text-[#e1306c]"
              >
                <Instagram className="h-4 w-4 text-[#e1306c]" />
              </Social>
              <Social 
                href="https://discord.gg/88AnpuNc6E" 
                label="Discord"
                className="hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-[#5865f2]"
              >
                <MessageCircle className="h-4 w-4 text-[#5865f2]" />
              </Social>
              <Social 
                href="https://iiitiansnetwork.com" 
                label="Website"
                className="hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-[#10b981]"
              >
                <Globe className="h-4 w-4 text-[#10b981]" />
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
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition shadow-sm cursor-pointer ${className}`}
    >
      {children}
      {label}
    </a>
  );
}
