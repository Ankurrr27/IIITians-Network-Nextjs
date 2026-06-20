"use client";

import React from "react";
import { Handshake, ArrowRight } from "lucide-react";

export default function CollaborateSection() {
  const mailSubject = "Collaboration Request";
  const emailHref = `mailto:iiitiansnetwork@gmail.com?subject=${encodeURIComponent(mailSubject)}`;

  const partners = [
    { name: "Startups", description: "Get direct campus visibility and pilot your developer tools within active student bodies." },
    { name: "Communities", description: "Co-host fests, webinars, and open-source events bridging student communities." },
    { name: "Student Clubs", description: "Verify your club chapter, request resources, and network with active peer societies." },
    { name: "Companies", description: "Sponsor nationwide hackathons and target recruitment drives across top campuses." },
  ];

  return (
    <section className="bg-slate-50/50 py-16 sm:py-24 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
              Partnership
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Collaborate With Us
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base font-medium">
              We work with clubs, startups, and enterprises to build opportunities, verify programs, and establish active bridges. Partner with IIITians Network to expand your reach.
            </p>
            <div className="mt-8">
              <a
                href={emailHref}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95"
              >
                Collaborate
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md duration-200"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <h3 className="text-sm font-extrabold text-slate-950 tracking-tight">{partner.name}</h3>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-500 font-semibold">
                  {partner.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
