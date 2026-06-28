"use client";

import React from "react";
import { CalendarDays, ArrowRight } from "lucide-react";

export default function EventCoverageSection() {
  const mailSubject = "Event Coverage Request";
  const emailHref = `mailto:iiitiansnetwork@gmail.com?subject=${encodeURIComponent(mailSubject)}`;

  return (
    <section className="bg-white py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mx-4 sm:mx-0 sm:rounded-[2.5rem] border-y sm:border border-slate-200 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/40 px-4 py-8 sm:p-14 shadow-sm">
          <div className="mx-auto max-w-3xl text-left">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="inline-flex shrink-0 rounded-xl sm:rounded-2xl bg-indigo-50 border border-indigo-100 p-2.5 sm:p-3 text-indigo-600">
                <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Want Your Event Featured?
              </h2>
            </div>
            <div className="mt-6 sm:mt-8 flex">
              <a
                href={emailHref}
                className="inline-flex justify-center items-center gap-2 w-full sm:w-auto rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95 sm:px-8"
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
