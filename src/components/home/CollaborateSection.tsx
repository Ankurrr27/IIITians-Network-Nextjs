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
    <section className="hidden sm:block bg-slate-50/50 py-10 sm:py-16 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl mt-0 sm:mt-4 font-bold tracking-tight text-slate-900 sm:text-4xl">
              Collaborate With Us
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 font-medium sm:text-lg sm:leading-relaxed lg:max-w-md">
              We're building the largest unified ecosystem across all 31 IIITs. Partner with us to reach top engineering talent, co-host nationwide events, and empower the next generation of developers.
            </p>
            <div className="mt-6 sm:mt-8">
              <a
                href={emailHref}
                className="inline-flex justify-center w-full sm:w-auto items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95"
              >
                Collaborate
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="grid gap-0 sm:gap-4 sm:grid-cols-2 -mx-4 sm:mx-0">
            {partners.map((partner, index) => (
              <div
                key={partner.name}
                className={`sm:rounded-2xl border-b sm:border border-slate-200/80 bg-white px-4 py-5 sm:p-5 shadow-sm transition hover:shadow-md duration-200 ${index === 0 ? "border-t sm:border-t-slate-200/80 sm:border-t" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <h3 className="text-sm font-extrabold text-slate-950 tracking-tight">{partner.name}</h3>
                </div>
                <p className="mt-2 text-[11px] sm:text-xs leading-relaxed text-slate-500 font-semibold">
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
