"use client";

import React from "react";
import { GraduationCap, Briefcase, Building } from "lucide-react";

export default function StakeholdersSection() {
  const points = [
    {
      title: "Students",
      icon: GraduationCap,
      description: "Connect with peers across all IIIT campuses. Engage in student fests, share programming hackathons, coordinate tech clubs, and prepare for placement tests with verified resource databases.",
      highlights: ["Cross-campus collaboration", "Placement statistics", "Inter-IIIT fests & clubs"],
    },
    {
      title: "Alumni",
      icon: Briefcase,
      description: "Stay linked with your alma mater and the broader IIIT network. Offer mentorship to juniors, post job opportunities, share industry insights, and expand your professional circle across all batches.",
      highlights: ["Mentorship networks", "Alumni verification", "Referrals & job postings"],
    },
    {
      title: "Industry",
      icon: Building,
      description: "Reach qualified student talent across specialized information technology disciplines. Recruit directly, sponsor hackathons and cultural events, and explore technical project partnerships.",
      highlights: ["Direct talent access", "Event sponsorship", "Campus outreach"],
    },
  ];

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
            Stakeholders
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Designed for the Entire Community
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base font-medium">
            Bridging students, graduates, and organizations to build a stronger and more collaborative ecosystem.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between transition hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg duration-300"
              >
                <div>
                  <div className="inline-flex rounded-xl bg-indigo-50 border border-indigo-100 p-3 text-indigo-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-extrabold text-slate-950 tracking-tight">{point.title}</h3>
                  <p className="mt-3.5 text-sm leading-relaxed text-slate-600 font-medium">
                    {point.description}
                  </p>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <ul className="space-y-2">
                    {point.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
