"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { iiitCampuses } from "@/data/iiitCampuses";
import type { IIITCampus } from "@/data/iiitCampuses";
import api from "@/lib/apiClient";
import type { ICollege } from "@/types";

function MapSkeleton() {
  return (
    <div className="relative h-[28rem] overflow-hidden rounded-none border-x-0 border-y border-slate-200 -mx-4 bg-slate-100 sm:mx-0 sm:rounded-[1.15rem] sm:border lg:h-[32rem]">
      {/* shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      {/* fake grid lines to mimic a map */}
      <svg className="absolute inset-0 h-full w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="map-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#94a3b8" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#map-grid)" />
      </svg>

      {/* fake markers scattered on the map */}
      {[
        { top: "28%", left: "38%" },
        { top: "42%", left: "55%" },
        { top: "55%", left: "32%" },
        { top: "35%", left: "70%" },
        { top: "65%", left: "60%" },
        { top: "22%", left: "60%" },
        { top: "72%", left: "44%" },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-200"
          style={{ top: pos.top, left: pos.left, transform: "translate(-50%,-50%)" }}
        >
          <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </div>
      ))}

      {/* bottom info card skeleton */}
      <div className="absolute bottom-0 left-0 right-0 z-10 rounded-t-2xl border-t border-slate-200 bg-white/90 p-3 backdrop-blur-md sm:bottom-3 sm:left-3 sm:right-3 sm:rounded-2xl sm:border md:left-auto md:right-3 md:w-[22rem]">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/4 rounded bg-slate-200" />
            <div className="h-2.5 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <div className="h-7 rounded-full bg-slate-200" />
          <div className="h-7 rounded-full bg-slate-100" />
          <div className="h-7 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

const ExploreYourIIITMap = dynamic(() => import("./ExploreYourIIITMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2.5 py-2 ring-1 ring-slate-200/70">
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-slate-900">{value}</div>
    </div>
  );
}

function normalizeCollegeName(value: string) {
  return value
    .toLowerCase()
    .replace(/international institute of information technology/g, "iiit")
    .replace(/indian institute of information technology/g, "iiit")
    .replace(/atal bihari vajpayee/g, "abv")
    .replace(/[^a-z0-9]/g, "");
}

export default function ExploreYourIIITSection() {
  const [query, setQuery] = useState("");
  const [campuses, setCampuses] = useState<IIITCampus[]>(iiitCampuses);
  const [selectedCampus, setSelectedCampus] = useState<IIITCampus>(iiitCampuses[0]);

  useEffect(() => {
    api.get("/colleges")
      .then((res) => {
        const dbColleges = Array.isArray(res.data) ? res.data as ICollege[] : [];
        const merged = iiitCampuses.map((campus) => {
          const matched = dbColleges.find(
            (college) => {
              const campusName = normalizeCollegeName(campus.name);
              const collegeName = normalizeCollegeName(college.name || "");
              return collegeName === campusName || collegeName.includes(campusName) || campusName.includes(collegeName);
            }
          );
          if (matched && matched.logo?.url) {
            return {
              ...campus,
              logo: matched.logo.url,
            };
          }
          return campus;
        });
        setCampuses(merged);
        setSelectedCampus((prev) => {
          const found = merged.find((c) => c.id === prev.id);
          return found || merged[0];
        });
      })
      .catch((err) => {
        console.error("Failed to load college logos from database:", err);
      });
  }, []);

  const filteredCampuses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return campuses;
    return campuses.filter((campus) =>
      [campus.name, campus.city, campus.state].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [query, campuses]);

  const statesCovered = useMemo(() => {
    return new Set(campuses.map((campus) => campus.state)).size;
  }, [campuses]);

  const handleSelect = (campus: IIITCampus) => {
    setSelectedCampus(campus);
    setQuery(campus.name);
  };

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_100%)] py-8 sm:py-14">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_10%,rgba(79,70,229,0.12),transparent_30%),radial-gradient(circle_at_90%_30%,rgba(14,165,233,0.14),transparent_28%)]" />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-5 px-4 sm:px-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
          className="space-y-4 self-start"
        >
          {/* Heading + stats — flat on mobile, panel on desktop */}
          <div className="sm:rounded-[1.25rem] sm:border sm:border-white/80 sm:bg-white/70 sm:p-5 sm:shadow-sm sm:backdrop-blur">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl leading-tight">
  Explore <span className="text-indigo-600"> Your IIIT</span>
</h2>
            <p className="hidden sm:block mt-2 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base sm:leading-7">
              Explore every IIIT across India, compare campuses, and discover the student communities connected through IIITians Network.
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4">
              <MiniStat label="Total IIITs" value={campuses.length} />
              <MiniStat label="States" value={statesCovered} />
              <MiniStat label="Network" value="50K+" />
            </div>
          </div>

          {/* Search panel — flat on mobile, panel on desktop */}
          <div className="sm:rounded-[1.15rem] sm:border sm:border-white/80 sm:bg-white/85 sm:p-3 sm:shadow-sm sm:backdrop-blur">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 transition focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search IIIT by name, city or state"
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                aria-label="Search IIIT campuses"
              />
            </label>
            <div className="mt-3 max-h-36 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
              {filteredCampuses.slice(0, 8).map((campus) => (
                <button
                  key={campus.id}
                  type="button"
                  onClick={() => handleSelect(campus)}
                  className={`flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-left transition cursor-pointer ${
                    selectedCampus.id === campus.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  <span className="font-medium text-xs">{campus.name}</span>
                  <span className="text-[10px] opacity-75 shrink-0 ml-2">{campus.state}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="relative self-start"
        >
          <ExploreYourIIITMap campuses={campuses} selectedCampus={selectedCampus} onSelect={setSelectedCampus} />
          <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600 shadow-sm backdrop-blur">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
              Live campus map
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
