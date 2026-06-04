"use client";

import React, { useState } from "react";
import { ExternalLink, Plus } from "lucide-react";

const counsellingPoints = [
  {
    title: "Rank-Based Guidance",
    content:
      "Suggestions aligned with your JEE rank, category, and preferences to help you shortlist realistic institute and branch options.",
  },
  {
    title: "IIIT & Branch Comparison",
    content:
      "Clear comparison of IIITs and branches based on academics, placements, campus life, and long-term opportunities.",
  },
  {
    title: "Student-Led Insights",
    content:
      "First-hand guidance from current IIIT students who have already gone through JoSAA and CSAB counselling.",
  },
  {
    title: "Unified IIIT Collaboration",
    content:
      "Connecting IIITians together across all campuses to enhance peer-to-peer communication, collaboration, and collective student support.",
  },
  {
    title: "Centralized Information Hub",
    content:
      "Circulating official notices, student news, and verified placement/academic data around all IIITs under one unified hood.",
  },
  {
    title: "Startups & Events Promotion",
    content:
      "Promoting campus events, student hackathons, and innovative startups or products developed by members of the IIIT network.",
  },
];

const counsellingPortals = [
  { label: "JoSAA Official Website", href: "https://josaa.nic.in" },
  { label: "CSAB Official Website", href: "https://csab.nic.in" },
];

export default function CounsellingSection() {
  const [active, setActive] = useState<number | null>(null);
  const [showMore, setShowMore] = useState(false);

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16 text-left">
          
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl leading-tight">
                JEE Counselling Guidance
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base font-semibold">
                Practical, experience-backed support for JoSAA and CSAB counselling, designed to help aspirants make confident and informed choices.
              </p>
            </div>

            <div className="space-y-5 text-base leading-7 text-slate-600 sm:text-[1.05rem] sm:leading-8">
              <p>
                IIITians Network simplifies the JEE counselling process by providing aspirants with clear, unbiased guidance based on real student experiences across IIITs.
              </p>
              
              <div className={`${showMore ? "block" : "hidden"} space-y-4 sm:block`}>
                <p>
                  We focus on reducing confusion during JoSAA and CSAB rounds by explaining institute realities, branch expectations, cutoff trends, and placement stats without exaggeration or false promises.
                </p>

                <ul className="space-y-3 pt-2">
                  {[
                    "Institute-wise and branch-wise counselling clarity",
                    "Previous year cutoff trends and interpretation",
                    "Academic workload and placement expectations",
                    "Common mistakes to avoid during choice filling"
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm sm:text-base font-medium">
                        {/* badge removed */}
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowMore((prev) => !prev)}
              className="text-sm font-bold text-indigo-600 transition hover:text-indigo-700 sm:hidden cursor-pointer"
            >
              {showMore ? "Read less" : "Read more"}
            </button>

            <div className="hidden pt-4 sm:block">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Official counselling portals
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {counsellingPortals.map((portal) => (
                  <a
                    key={portal.href}
                    href={portal.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <span>{portal.label}</span>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-indigo-600" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (How We Help Accordion) */}
          <div className="space-y-6">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-[1.85rem] lg:leading-tight">
              How We Help
            </h3>

            <div className="space-y-3.5">
              {counsellingPoints.map((item, index) => (
                <div
                  key={index}
                  className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                    active === index 
                      ? "border-indigo-300 ring-4 ring-indigo-50/50 shadow-md" 
                      : "border-slate-200/80 hover:border-indigo-200 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setActive(active === index ? null : index)}
                    className="flex w-full items-center justify-between p-4 text-left focus:outline-none cursor-pointer"
                  >
                    <span className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                      {item.title}
                    </span>
                    <span className={`text-indigo-600 font-bold transition-transform duration-300 ${active === index ? "rotate-45" : ""}`}>
                      <Plus className="h-4.5 w-4.5" />
                    </span>
                  </button>

                  {active === index && (
                    <div className="px-4 pb-4 text-xs text-slate-600 sm:pb-5 sm:text-sm leading-relaxed font-medium">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View Portals */}
        <div className="mt-10 flex flex-col gap-3 sm:hidden">
          {counsellingPortals.map((portal) => (
            <a
              key={portal.href}
              href={portal.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {portal.label}
              <ExternalLink className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
