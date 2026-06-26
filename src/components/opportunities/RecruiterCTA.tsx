"use client";

import { ArrowRight, Building2, Users, Globe } from "lucide-react";

interface RecruiterCTAProps {
  isDarkMode: boolean;
  onPostClick: () => void;
}

export default function RecruiterCTA({ isDarkMode, onPostClick }: RecruiterCTAProps) {
  return (
    <section
      id="recruiters"
      className={`rounded-2xl border p-6 sm:p-8 transition-colors duration-300 h-full flex flex-col justify-between ${
        isDarkMode
          ? "border-slate-800 bg-slate-900/60"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      <div className="flex flex-col gap-6">
        <div className="max-w-xl">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.24em] ${
              isDarkMode ? "text-indigo-400" : "text-indigo-600"
            }`}
          >
            For Recruiters
          </p>
          <h2
            className={`mt-3 text-xl font-bold tracking-tight sm:text-2xl ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Hire Across All IIITs — From One Platform
          </h2>
          <p
            className={`mt-3 text-sm leading-relaxed ${
              isDarkMode ? "text-slate-400" : "text-slate-650 font-semibold"
            }`}
          >
            Instead of contacting 31 campuses individually, reach the entire IIIT ecosystem
            through one verified talent network. Post your opportunity and connect with
            students and alumni from every IIIT in India.
          </p>

          {/* Stats chips */}
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { icon: Building2, text: "31 IIITs" },
              { icon: Users, text: "10,000+ Students" },
              { icon: Globe, text: "One Platform" },
            ].map((chip) => {
              const Icon = chip.icon;
              return (
                <div
                  key={chip.text}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                    isDarkMode
                      ? "border-slate-800 bg-slate-955/50 text-slate-300"
                      : "border-slate-200 bg-slate-50 text-slate-650"
                  }`}
                >
                  <Icon size={13} className={isDarkMode ? "text-indigo-400" : "text-indigo-600"} />
                  {chip.text}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onPostClick}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95 flex-1"
        >
          Post Your First Opportunity
          <ArrowRight size={16} />
        </button>
        <a
          href="mailto:iiitiansnetwork@gmail.com?subject=Recruiter Partnership Inquiry"
          className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition active:scale-95 sm:flex-initial ${
            isDarkMode
              ? "border-slate-800 text-slate-200 hover:border-slate-700 hover:text-white"
              : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          Contact Us
        </a>
      </div>
    </section>
  );
}
