"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Briefcase, Building } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const points = [
  {
    title: "Students",
    icon: GraduationCap,
    description:
      "Connect with peers across all IIIT campuses. Engage in student fests, share programming hackathons, coordinate tech clubs, and prepare for placement tests with verified resource databases.",
    highlights: ["Cross-campus collaboration", "Placement statistics", "Inter-IIIT fests & clubs"],
    gradient: "from-indigo-500/10 via-blue-500/5 to-transparent",
    accentBorder: "group-hover:border-indigo-300",
    accentBorderMobile: "border-indigo-200",
    iconBg: "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 text-indigo-600",
    dotColor: "bg-indigo-500",
    selectorActive: "bg-indigo-600 text-white shadow-md shadow-indigo-200",
    selectorInactive: "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50",
    highlightText: "text-indigo-700",
  },
  {
    title: "Alumni",
    icon: Briefcase,
    description:
      "Stay linked with your alma mater and the broader IIIT network. Offer mentorship to juniors, post job opportunities, share industry insights, and expand your professional circle across all batches.",
    highlights: ["Mentorship networks", "Alumni verification", "Referrals & job postings"],
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    accentBorder: "group-hover:border-emerald-300",
    accentBorderMobile: "border-emerald-200",
    iconBg: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 text-emerald-600",
    dotColor: "bg-emerald-500",
    selectorActive: "bg-emerald-600 text-white shadow-md shadow-emerald-200",
    selectorInactive: "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50",
    highlightText: "text-emerald-700",
  },
  {
    title: "Industry",
    icon: Building,
    description:
      "Reach qualified student talent across specialized information technology disciplines. Recruit directly, sponsor hackathons and cultural events, and explore technical project partnerships.",
    highlights: ["Direct talent access", "Event sponsorship", "Campus outreach"],
    gradient: "from-violet-500/10 via-purple-500/5 to-transparent",
    accentBorder: "group-hover:border-violet-300",
    accentBorderMobile: "border-violet-200",
    iconBg: "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100 text-violet-600",
    dotColor: "bg-violet-500",
    selectorActive: "bg-violet-600 text-white shadow-md shadow-violet-200",
    selectorInactive: "text-slate-500 hover:text-violet-600 hover:bg-violet-50",
    highlightText: "text-violet-700",
  },
];

export default function StakeholdersSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = points[activeIdx];
  const Icon = active.icon;

  return (
    <section className="relative bg-white py-10 sm:py-16 overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-indigo-50/80 blur-[80px]" />
        <div className="absolute -right-32 bottom-1/4 h-64 w-64 rounded-full bg-emerald-50/80 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-left"
        >
          <h2 className="mt-1 sm:mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-900">
            Designed for the Entire{" "}
            <span className="text-indigo-600">Community</span>
          </h2>
        </motion.div>

        {/* ── MOBILE ONLY: pill selector + content panel ── */}
        <div className="sm:hidden">
          {/* Pill tabs */}
          <div className="mt-5 flex w-full items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
            {points.map((p, idx) => {
              const PIcon = p.icon;
              const isActive = activeIdx === idx;
              return (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-all duration-200 ${
                    isActive ? p.selectorActive : `${p.selectorInactive} bg-transparent`
                  }`}
                >
                  <PIcon className="h-3 w-3 shrink-0" />
                  {p.title}
                </button>
              );
            })}
          </div>

          {/* Animated content panel */}
          <div className="mt-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`pl-3 border-l-2 ${active.accentBorderMobile}`}
              >
                {/* Description */}
                <p className="text-xs leading-relaxed text-slate-500 font-medium">
                  {active.description}
                </p>

                {/* Highlights */}
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {active.highlights.map((h) => (
                    <li
                      key={h}
                      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${active.highlightText}`}
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active.dotColor}`} />
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── DESKTOP ONLY: original 3-card grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="hidden sm:grid mt-10 gap-6 md:grid-cols-3"
        >
          {points.map((point) => {
            const PIcon = point.icon;
            return (
              <motion.div
                key={point.title}
                variants={cardVariants}
                className={`group relative sm:rounded-xl border border-slate-200 bg-white p-7 shadow-sm flex flex-col justify-between transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(79,70,229,0.10)] ${point.accentBorder}`}
              >
                {/* Gradient overlay on hover */}
                <div className={`pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br ${point.gradient} opacity-0 transition-opacity duration-400 group-hover:opacity-100`} />

                <div className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`inline-flex shrink-0 rounded-xl border p-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${point.iconBg}`}>
                      <PIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-950 tracking-tight">{point.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600 font-medium">
                    {point.description}
                  </p>
                </div>
                <div className="relative z-10 mt-6 border-t border-slate-100 pt-4">
                  <ul className="space-y-2">
                    {point.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span className={`h-1.5 w-1.5 rounded-full ${point.dotColor} transition-transform duration-300 group-hover:scale-150`} />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
