"use client";

import React from "react";
import { motion } from "framer-motion";
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

export default function StakeholdersSection() {
  const points = [
    {
      title: "Students",
      icon: GraduationCap,
      description: "Connect with peers across all IIIT campuses. Engage in student fests, share programming hackathons, coordinate tech clubs, and prepare for placement tests with verified resource databases.",
      highlights: ["Cross-campus collaboration", "Placement statistics", "Inter-IIIT fests & clubs"],
      gradient: "from-indigo-500/10 via-blue-500/5 to-transparent",
      accentBorder: "group-hover:border-indigo-300",
      iconBg: "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 text-indigo-600",
      dotColor: "bg-indigo-500",
    },
    {
      title: "Alumni",
      icon: Briefcase,
      description: "Stay linked with your alma mater and the broader IIIT network. Offer mentorship to juniors, post job opportunities, share industry insights, and expand your professional circle across all batches.",
      highlights: ["Mentorship networks", "Alumni verification", "Referrals & job postings"],
      gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
      accentBorder: "group-hover:border-emerald-300",
      iconBg: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 text-emerald-600",
      dotColor: "bg-emerald-500",
    },
    {
      title: "Industry",
      icon: Building,
      description: "Reach qualified student talent across specialized information technology disciplines. Recruit directly, sponsor hackathons and cultural events, and explore technical project partnerships.",
      highlights: ["Direct talent access", "Event sponsorship", "Campus outreach"],
      gradient: "from-violet-500/10 via-purple-500/5 to-transparent",
      accentBorder: "group-hover:border-violet-300",
      iconBg: "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100 text-violet-600",
      dotColor: "bg-violet-500",
    },
  ];

  return (
    <section className="relative bg-white py-10 sm:py-16 overflow-hidden">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-indigo-50/80 blur-[80px]" />
        <div className="absolute -right-32 bottom-1/4 h-64 w-64 rounded-full bg-emerald-50/80 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-left"
        >
          <h2 className="mt-1 sm:mt-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Designed for the Entire Community
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-6 sm:mt-10 grid gap-4 sm:gap-6 md:grid-cols-3 -mx-4 sm:mx-0"
        >
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.title}
                variants={cardVariants}
                className={`group relative sm:rounded-xl border-y sm:border-y-0 sm:border border-slate-200 bg-white px-4 py-6 sm:p-7 shadow-sm flex flex-col justify-between transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(79,70,229,0.10)] ${point.accentBorder}`}
              >
                {/* Gradient overlay on hover */}
                <div className={`pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br ${point.gradient} opacity-0 transition-opacity duration-400 group-hover:opacity-100`} />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`inline-flex shrink-0 rounded-xl border p-3 sm:p-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${point.iconBg}`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight">{point.title}</h3>
                  </div>
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
                    {point.description}
                  </p>
                </div>
                <div className="relative z-10 mt-5 sm:mt-6 border-t border-slate-100 pt-4">
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
