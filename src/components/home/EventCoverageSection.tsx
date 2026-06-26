"use client";

import React from "react";
import { CalendarDays, ArrowRight } from "lucide-react";

export default function EventCoverageSection() {
  const mailSubject = "Event Coverage Request";
  const emailHref = `mailto:iiitiansnetwork@gmail.com?subject=${encodeURIComponent(mailSubject)}`;

  return (
    <section className="bg-white py-16 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 p-8 shadow-sm sm:p-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-2xl bg-indigo-50 border border-indigo-100 p-3 text-indigo-600 mb-6">
              <CalendarDays className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Want Your Event Featured?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base font-medium">
              If you are organizing a hackathon, fest, workshop, webinar, conference, or community event across any IIIT, we would love to feature it and promote it through the IIITians Network platforms. Let&apos;s showcase your campus innovation nationwide.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href={emailHref}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95 sm:px-8"
              >
                Submit Event
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
