"use client";

import React from "react";
import Link from "next/link";
import { Network, Users, Award, Briefcase, Calendar, ChevronRight } from "lucide-react";

export default function NetworkVisualization() {
  const metrics = [
    { label: "IIIT Campuses", value: "25+", icon: Network, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "Community Members", value: "5,000+", icon: Users, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Connected Alumni", value: "1,200+", icon: Award, color: "text-sky-600 bg-sky-50 border-sky-100" },
    { label: "Opportunities Shared", value: "450+", icon: Briefcase, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "Events Covered", value: "180+", icon: Calendar, color: "text-rose-600 bg-rose-50 border-rose-100" },
  ];

  const topCampuses = [
    "IIIT Allahabad",
    "IIIT Delhi",
    "IIIT Gwalior",
    "IIIT Hyderabad",
    "IIIT Kota",
    "IIIT Lucknow",
    "IIIT Nagpur",
    "IIIT Pune",
    "IIIT Ranchi",
    "IIIT Sri City",
  ];

  return (
    <section className="bg-slate-50/50 py-16 sm:py-24 border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
            Scale & Network
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            A Nationwide Multi-IIIT Ecosystem
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base font-medium">
            Discover a transparent student-led directory, alumni networks, and opportunities bridging IIIT campuses across India.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 duration-300"
              >
                <div className={`inline-flex rounded-xl border p-2.5 ${metric.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-2xl font-black text-slate-950 tracking-tight">{metric.value}</h3>
                <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
              </div>
            );
          })}
        </div>

        {/* Campuses Grid Visualization */}
        <div className="mt-10 rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Explore Campus Hubs</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Direct community directories</p>
            </div>
            <Link
              href="/colleges"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition"
            >
              Explore Full Directory
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {topCampuses.map((campus) => (
              <Link
                key={campus}
                href={`/colleges?search=${encodeURIComponent(campus)}`}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/30 p-3.5 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-indigo-100 hover:bg-indigo-50/50 hover:text-indigo-700 hover:-translate-y-0.5 duration-200"
              >
                <span>{campus}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 transition" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
