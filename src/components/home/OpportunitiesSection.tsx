"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Github,
  Trophy,
  Building2,
  Rocket,
  ChevronRight,
  MapPin,
  ShieldCheck,
} from "lucide-react";

type Category = "Internships" | "Full-Time" | "Research" | "Open Source" | "Hackathons" | "Startups";

type Opportunity = {
  title: string;
  provider: string;
  location: string;
  details: string;
  linkText: string;
  verified?: boolean;
};

export default function OpportunitiesSection() {
  const [activeTab, setActiveTab] = useState<Category>("Internships");

  const tabs: { name: Category; icon: React.ElementType }[] = [
    { name: "Internships", icon: Briefcase },
    { name: "Full-Time", icon: Building2 },
    { name: "Research", icon: GraduationCap },
    { name: "Open Source", icon: Github },
    { name: "Hackathons", icon: Trophy },
    { name: "Startups", icon: Rocket },
  ];

  const data: Record<Category, Opportunity[]> = {
    Internships: [
      { title: "Frontend Engineering Intern", provider: "Fintech Startup (Alumni Led)", location: "Remote / Bengaluru", details: "Build reactive dashboards using Next.js, Tailwind CSS, and state management. Work directly under a Senior Architect (IIIT Gwalior alumnus).", linkText: "Learn more", verified: true },
      { title: "Product Design Intern", provider: "IIITians Network Web Team", location: "Remote", details: "Iterate on user flows, design official merchandising mockups, and run accessibility compliance checks for the centralized network portal.", linkText: "Apply now", verified: true },
      { title: "Backend Systems Intern", provider: "CloudScale Inc.", location: "Pune / Hybrid", details: "Develop high-throughput microservices using Go and PostgreSQL. Excellent opportunity to learn system design and container orchestration.", linkText: "Apply now", verified: true },
    ],
    "Full-Time": [
      { title: "Software Development Engineer", provider: "TechCorp India", location: "Hyderabad", details: "Join our platform engineering team to build distributed systems at scale. Strong DSA, system design, and backend fundamentals required.", linkText: "View details", verified: true },
      { title: "ML Engineer", provider: "DataMinds AI", location: "Bengaluru / Hybrid", details: "Design and deploy production ML pipelines for recommendation systems. Experience with PyTorch and large-scale data processing preferred.", linkText: "View details", verified: true },
    ],
    Research: [
      { title: "Machine Learning Research Assistant", provider: "AI Lab, IIIT Delhi", location: "New Delhi / Hybrid", details: "Work on computer vision and multimodal model alignment. Ideal for third/fourth-year undergraduate students aiming for research papers.", linkText: "View details", verified: true },
      { title: "Natural Language Processing Intern", provider: "LTRC, IIIT Hyderabad", location: "Hyderabad", details: "Contribute to Indian language translation models. Requires proficiency in Python and deep learning frameworks.", linkText: "View details", verified: true },
    ],
    "Open Source": [
      { title: "Next.js Central Portal Contribution", provider: "IIITians Network", location: "GitHub", details: "Help optimize placement search index filters, build the merchandise custom store canvas, and resolve responsiveness bug tickets.", linkText: "GitHub repo", verified: true },
      { title: "Discuss Forums Auth Integration", provider: "Student Discuss Team", location: "GitHub", details: "Implement secure OAuth flows for official club manager profiles using NextAuth and MongoDB adapter patterns.", linkText: "GitHub repo", verified: true },
    ],
    Hackathons: [
      { title: "Inter-IIIT Hackathon 2026", provider: "IIITians Network Community", location: "Online / Hybrid", details: "24-hour development sprint bringing teams from all 31 IIITs to solve structural challenges in education, tech, and college outreach.", linkText: "Register", verified: true },
      { title: "Smart India Hackathon Prep-Sprint", provider: "Coding Clubs Joint Alliance", location: "Host Campuses", details: "A preparatory mock hackathon featuring review panels of senior alumni who previously won SIH to critique problem statements.", linkText: "Join sprint" },
    ],
    Startups: [
      { title: "Founding Engineer", provider: "NexEd (IIIT Hyderabad Alumni)", location: "Bengaluru", details: "Join as the first engineer at an EdTech startup building AI-powered personalized learning paths. Founded by IIIT Hyderabad alumni.", linkText: "Apply now", verified: true },
      { title: "Growth Intern", provider: "HealthStack (Seed Stage)", location: "Remote", details: "Drive user acquisition and retention for a HealthTech startup building remote diagnostics tools for Tier-2/3 cities.", linkText: "Apply now", verified: true },
    ],
  };

  return (
    <section className="bg-slate-50/50 py-8 sm:py-16 border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="text-left">
            <h2 className="mt-0 sm:mt-4 text-xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-slate-100">
              Explore{" "}
              <span className="text-indigo-600"> Opportunities</span>
            </h2>
            
            {/* Desktop Tabs */}
            <div className="mt-4 sm:mt-6 hidden sm:flex flex-wrap gap-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.name;
                return (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all duration-200 active:scale-95 ${
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
          </div>

          {/* Global CTA (Moved to top on desktop, bottom on mobile) */}
          <div className="hidden sm:flex flex-col sm:items-start lg:items-end gap-3 px-4 sm:px-0">
            <Link
              href="/opportunities"
              className="inline-flex justify-center w-full sm:w-auto items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-95"
            >
              Explore the Talent Marketplace
              <ChevronRight size={16} className="text-slate-400" />
            </Link>
            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold text-left lg:text-right leading-relaxed">
              Are you a recruiter?{" "}
              <Link href="/opportunities?post=true" className="text-indigo-600 hover:text-indigo-700 transition">
                Post opportunities
              </Link>{" "}
              to reach all IIITs.
            </p>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <div className="mt-3 sm:hidden px-4">
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as Category)}
              className="block w-full appearance-none rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {tabs.map((tab) => (
                <option key={tab.name} value={tab.name}>
                  {tab.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tab content listings */}
        <div className="mt-4 sm:mt-8 grid gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 -mx-4 sm:mx-0">
          {data[activeTab].map((opp, index) => (
            <div
              key={index}
              className="flex flex-col justify-between sm:rounded-xl border-y sm:border-y-0 sm:border border-slate-200/80 bg-white px-4 py-3.5 sm:p-6 shadow-sm transition hover:shadow-md hover:border-slate-300 duration-200"
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
                  {opp.verified && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                      <ShieldCheck size={10} />
                      Verified
                    </span>
                  )}
                </div>
                <h3 className="mt-2 sm:mt-4 text-sm sm:text-base font-extrabold text-slate-950 tracking-tight">{opp.title}</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wide mt-0.5">{opp.provider}</p>
                <p className="mt-2 sm:mt-3.5 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium line-clamp-3 sm:line-clamp-none">
                  {opp.details}
                </p>
              </div>

              <div className="mt-3 sm:mt-6 border-t border-slate-100 pt-2.5 sm:pt-4 flex justify-end">
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

        {/* Mobile Global CTA */}
        <div className="flex sm:hidden flex-col items-start gap-2.5 mt-5 px-4">
          <Link
            href="/opportunities"
            className="inline-flex justify-between w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-95"
          >
            <span>Explore the Talent Marketplace</span>
            <ChevronRight size={14} className="text-slate-400 shrink-0" />
          </Link>
          <p className="text-[11px] text-slate-500 font-semibold text-left leading-relaxed">
            Are you a recruiter?{" "}
            <Link href="/opportunities?post=true" className="text-indigo-600 hover:text-indigo-700 transition">
              Post opportunities
            </Link>{" "}
            to reach all IIITs.
          </p>
        </div>
      </div>
    </section>
  );
}
