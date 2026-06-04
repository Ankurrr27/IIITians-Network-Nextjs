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

const ExploreYourIIITMap = dynamic(() => import("./ExploreYourIIITMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[22rem] animate-pulse rounded-[1.15rem] border border-white/80 bg-[linear-gradient(135deg,#eef2ff,#f8fbff)] sm:h-[28rem] lg:h-[32rem]" />
  ),
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
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_100%)] py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_10%,rgba(79,70,229,0.12),transparent_30%),radial-gradient(circle_at_90%_30%,rgba(14,165,233,0.14),transparent_28%)]" />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-5 px-4 sm:px-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
          className="space-y-4 self-start"
        >
          <div className="rounded-[1.25rem] border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur sm:p-5">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Explore Your IIIT</h2>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600">
              Explore every IIIT across India, compare campuses, and discover the student communities connected through IIITians Network.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat label="Total IIITs" value={campuses.length} />
              <MiniStat label="States" value={statesCovered} />
              <MiniStat label="Network" value="50K+" />
            </div>
          </div>

          <div className="rounded-[1.15rem] border border-white/80 bg-white/85 p-3 shadow-sm backdrop-blur">
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10">
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
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    selectedCampus.id === campus.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  <span className="font-semibold">{campus.name}</span>
                  <span className="text-xs opacity-75">{campus.state}</span>
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
