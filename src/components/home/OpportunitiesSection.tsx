"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Briefcase, GraduationCap, Github, Trophy, ChevronRight, Calendar, MapPin } from "lucide-react";

type Opportunity = {
  title: string;
  provider: string;
  location: string;
  details: string;
  linkText: string;
};

export default function OpportunitiesSection() {
  const [activeTab, setActiveTab] = useState<"Internships" | "Research" | "Open Source" | "Hackathons">("Internships");

  const tabs = [
    { name: "Internships", icon: Briefcase },
    { name: "Research", icon: GraduationCap },
    { name: "Open Source", icon: Github },
    { name: "Hackathons", icon: Trophy },
  ] as const;

  const data: Record<typeof activeTab, Opportunity[]> = {
    Internships: [
      { title: "Frontend Engineering Intern", provider: "Fintech Startup (Alumni Led)", location: "Remote / Bengaluru", details: "Build reactive dashboards using Next.js, Tailwind CSS, and state management. Work directly under a Senior Architect (IIIT Gwalior alumnus).", linkText: "Learn more" },
      { title: "Product Design Intern", provider: "IIITians Network Web Team", location: "Remote", details: "Iterate on user flows, design official merchandising mockups, and run accessibility compliance checks for the centralized network portal.", linkText: "Apply now" },
    ],
    Research: [
      { title: "Machine Learning Research Assistant", provider: "AI Lab, IIIT Delhi", location: "New Delhi / Hybrid", details: "Work on computer vision and multimodal model alignment. Ideal for third/fourth-year undergraduate students aiming for research papers.", linkText: "View details" },
      { title: "Natural Language Processing Intern", provider: "LTRC, IIIT Hyderabad", location: "Hyderabad", details: "Contribute to Indian language translation models. Requires proficiency in Python and deep learning frameworks.", linkText: "View details" },
    ],
    "Open Source": [
      { title: "Next.js Central Portal Contribution", provider: "IIITians Network", location: "GitHub", details: "Help optimize placement search index filters, build the merchandise custom store canvas, and resolve responsiveness bug tickets.", linkText: "GitHub repo" },
      { title: "Discuss Forums Auth Integration", provider: "Student Discuss Team", location: "GitHub", details: "Implement secure OAuth flows for official club manager profiles using NextAuth and MongoDB adapter patterns.", linkText: "GitHub repo" },
    ],
    Hackathons: [
      { title: "Inter-IIIT Hackathon 2026", provider: "IIITians Network Community", location: "Online / Hybrid", details: "24-hour development sprint bringing teams from all 25+ IIITs to solve structural challenges in education, tech, and college outreach.", linkText: "Register" },
      { title: "Smart India Hackathon Prep-Sprint", provider: "Coding Clubs Joint Alliance", location: "Host Campuses", details: "A preparatory mock hackathon featuring review panels of senior alumni who previously won SIH to critique problem statements.", linkText: "Join sprint" },
    ],
  };

  return (
    <section className="bg-slate-50/50 py-16 sm:py-24 border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
            Opportunities
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Explore Community Opportunities
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base font-medium">
            Find roles, hackathons, research assistants, and open source projects curated specifically for IIITians.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow shadow-indigo-500/20"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content listings */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {data[activeTab].map((opp, index) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300 duration-200"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    {activeTab}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                    <MapPin size={10} />
                    {opp.location}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-950 tracking-tight">{opp.title}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-0.5">{opp.provider}</p>
                <p className="mt-3.5 text-sm leading-relaxed text-slate-600 font-medium">
                  {opp.details}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end">
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                >
                  {opp.linkText}
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Global CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-95"
          >
            Explore All Opportunities
            <ChevronRight size={16} className="text-slate-400" />
          </Link>
        </div>
      </div>
    </section>
  );
}
