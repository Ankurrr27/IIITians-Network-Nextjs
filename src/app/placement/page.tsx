"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/apiClient";
import PlacementAnalytics from "./sections/PlacementAnalytics";
import { 
  Building2, Search, Loader2, Calendar, Award, ArrowUpRight, 
  ChevronDown, ArrowUpDown, Sparkles, Filter, Info, Briefcase, GraduationCap, X
} from "lucide-react";
import {
  formatLpa, summarizePlacementYear, summarizeAllYears,
  summarizePlacementCollection, buildPlacementFaqs,
  type YearSummary, type YearlyPlacement,
} from "@/lib/placementInsights";

// Selected popular campuses for quick access chips
const QUICK_CAMPUSES = [
  "ABV-IIITM Gwalior",
  "IIIT Kota",
  "IIIT Guwahati",
  "IIIT Lucknow",
  "IIIT Allahabad",
  "IIIT Pune"
];

export default function PlacementPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-bold text-slate-500">Loading placement dashboard...</p>
        </div>
      </div>
    }>
      <PlacementPageClient />
    </Suspense>
  );
}

function PlacementPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [college, setCollege] = useState(searchParams.get("college") || "");
  const [data, setData] = useState<any>(null);
  const [year, setYear] = useState<number | null>(
    searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : null
  );
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [collegeOptions, setCollegeOptions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // Load all placement college names
  useEffect(() => {
    api.get("/placements").then((res) => {
      const names = (res.data || [])
        .map((item: any) => item?.college?.name)
        .filter(Boolean);
      setCollegeOptions([...new Set(names)].sort() as string[]);
    }).catch(() => setCollegeOptions([]));
  }, []);

  // Handle initial URL params
  useEffect(() => {
    const c = searchParams.get("college");
    const y = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : null;
    if (c) searchCollege(c, y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchCollege = async (name: string, targetYear: number | null = null) => {
    if (!name?.trim() || loading) return;
    setLoading(true);
    setSearched(true);
    setCollege(name);
    try {
      const res = await api.get(`/placements/college-name/${encodeURIComponent(name)}`);
      setData(res.data);
      const years = (res.data.yearlyPlacements || []).map((e: any) => e.year);
      let nextYear = targetYear || year;
      if (!nextYear || !years.includes(nextYear)) nextYear = years.length ? Math.max(...years) : null;
      setYear(nextYear);

      // Sync URL parameters
      const url = new URL(window.location.href);
      url.searchParams.set("college", res.data.college?.name || name);
      if (nextYear) {
        url.searchParams.set("year", nextYear.toString());
      } else {
        url.searchParams.delete("year");
      }
      window.history.replaceState({}, "", url.toString());
    } catch {
      setData(null);
      setYear(null);
      const url = new URL(window.location.href);
      url.searchParams.delete("college");
      url.searchParams.delete("year");
      window.history.replaceState({}, "", url.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (y: number | null) => {
    setYear(y);
    const url = new URL(window.location.href);
    const currentCollege = data?.college?.name || college;
    if (currentCollege) {
      url.searchParams.set("college", currentCollege);
      if (y) {
        url.searchParams.set("year", y.toString());
      } else {
        url.searchParams.delete("year");
      }
    } else {
      url.searchParams.delete("college");
      url.searchParams.delete("year");
    }
    window.history.replaceState({}, "", url.toString());
  };

  const yearData = year ? data?.yearlyPlacements?.find((y2: any) => y2.year === year) : null;
  const selectedCollegeName = data?.college?.name || (searched ? college : null);

  const filteredSuggestions = useMemo(() => {
    const n = college.trim().toLowerCase();
    if (!n) return collegeOptions.slice(0, 6);
    return collegeOptions.filter((s) => s.toLowerCase().includes(n)).slice(0, 6);
  }, [collegeOptions, college]);

  const showSuggestions = isFocused && filteredSuggestions.length > 0 && !loading;

  return (
    <div className="relative min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f0f7ff_30%,#ffffff_100%)] pb-16 pt-24 text-slate-900 sm:pb-24 sm:pt-28">
      {/* Dynamic Background Auras */}
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.15),transparent_35%),radial-gradient(circle_at_85%_25%,rgba(14,165,233,0.15),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 sm:space-y-12 sm:px-6">
        
        {/* â”€â”€â”€ HERO HEADER â”€â”€â”€ */}
        <header className="space-y-4 text-left max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-700 shadow-sm"
          >
            <Briefcase className="h-3.5 w-3.5" />
            Verified Placement Hub
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl leading-tight"
          >
            {selectedCollegeName ? (
              <>
                <span className="text-slate-950">{selectedCollegeName}</span>{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">Insights</span>
              </>
            ) : (
              <>
                Explore & Compare <span className="bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">IIIT Placements</span>
              </>
            )}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl text-sm font-semibold leading-relaxed text-slate-600 sm:text-base"
          >
            Unbiased branch-wise performance packages, statistics, and trends sourced directly from IIIT student networks across India.
          </motion.p>
        </header>

        {/* â”€â”€â”€ SEARCH & FILTER UTILITY BAR â”€â”€â”€ */}
        <motion.section 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            {/* Search Input */}
            <div className="relative">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3.5 shadow-sm transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/10">
                <Search size={18} className="shrink-0 text-slate-400" />
                <input
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                  onKeyDown={(e) => e.key === "Enter" && searchCollege(college)}
                  placeholder="Search IIIT by name or city..."
                  disabled={loading}
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />
                {college && (
                  <button 
                    onClick={() => { setCollege(""); setData(null); setSearched(false); }}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Autocomplete suggestions */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-md"
                  >
                    {filteredSuggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setCollege(item); searchCollege(item); }}
                        className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <span className="truncate">{item}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Analyze stats</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Advanced Year Selector Chip Strip */}
            {data && (
              <div className="flex items-center">
                <YearSelector
                  years={data.yearlyPlacements.map((i: any) => i.year)}
                  value={year}
                  onChange={handleYearChange}
                />
              </div>
            )}
          </div>

          {/* Quick-Access Campus Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Select:</span>
            {QUICK_CAMPUSES.map((name) => (
              <button
                key={name}
                onClick={() => { setCollege(name); searchCollege(name); }}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all shadow-sm ${
                  college === name
                    ? "bg-indigo-600 text-white border-transparent"
                    : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </motion.section>

        {/* â”€â”€â”€ DYNAMIC CONTENT AREA â”€â”€â”€ */}
        
        {/* Loading Skeletons */}
        {loading && <PlacementSkeleton />}

        {/* Home/Landing Preview cards before search is initiated */}
        {!searched && !loading && (
          <PlacementPreview onSelectCollege={(name) => searchCollege(name, null)} />
        )}



        {/* Details Table & FAQs Container */}
        {data && !loading && (
          <PlacementResults 
            data={data} 
            year={year} 
            yearData={yearData} 
            selectedCollegeName={selectedCollegeName} 
          />
        )}

        {/* Empty States */}
        {searched && !loading && !data && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <Info className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-slate-900">No placements data found</h3>
            <p className="mt-1 max-w-sm text-sm font-medium text-slate-500">
              We couldn't retrieve records for "{college}". Try a different campus search like "IIIT Kota".
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* â”€â”€â”€ YearSelector Chip Strip (Replaces Default HTML Select) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function YearSelector({ years = [], value, onChange }: { years: number[]; value: number | null; onChange: (y: number | null) => void }) {
  if (!years.length) return null;
  const sorted = [...years].sort((a, b) => b - a);
  const latest = sorted[0];

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
      <div className="flex items-center gap-1 px-2.5 text-slate-400">
        <Calendar size={15} />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Year:</span>
      </div>
      <button
        onClick={() => onChange(latest)}
        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
          value === latest
            ? "bg-slate-950 text-white"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        {latest} (Latest)
      </button>
      {sorted.filter((y) => y !== latest).map((y) => (
        <button
          key={y}
          onClick={() => onChange(y)}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            value === y
              ? "bg-slate-950 text-white"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {y}
        </button>
      ))}
      <button
        onClick={() => onChange(null)}
        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
          value === null
            ? "bg-slate-950 text-white"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        All Years
      </button>
    </div>
  );
}

/* â”€â”€â”€ PlacementPreview Cards List â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function PlacementPreview({ onSelectCollege }: { onSelectCollege: (name: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/placements").then((res) => {
      setItems(summarizePlacementCollection(res.data || []).slice(0, 6));
    }).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md sm:p-8 lg:p-10">
      <div className="mb-8 space-y-2 text-left">
        <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
          <Sparkles className="h-4 w-4" /> Quick Insights
        </span>
        <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">Compare placement metrics on a glance</h2>
        <p className="max-w-2xl text-xs font-semibold leading-relaxed text-slate-500 sm:text-sm">
          Select a featured IIIT campus below to view branch summaries, charts, packages, and historical statistics.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-3">
              <div className="h-5 rounded bg-slate-200 w-2/3" />
              <div className="h-3 rounded bg-slate-100 w-1/3" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-10 rounded-xl bg-white" />
                <div className="h-10 rounded-xl bg-white" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c: any) => (
            <motion.div
              key={c.id}
              onClick={() => onSelectCollege(c.collegeName)}
              whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(0,0,0,0.04)" }}
              className="group cursor-pointer rounded-2xl border border-slate-200/60 bg-white p-5 transition hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition">
                    {c.collegeName}
                  </h4>
                  <span className="mt-1 inline-block text-[11px] font-semibold text-slate-400">
                    Latest Report: {c.year}
                  </span>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-indigo-600 transition" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-left">
                {c.highestPackage > 0 && (
                  <PreviewStat label="Highest Offer" value={formatLpa(c.highestPackage)} />
                )}
                {c.placementRate > 0 && (
                  <PreviewStat label="Placed Rate" value={`${c.placementRate.toFixed(1)}%`} />
                )}
                {c.medianPackage > 0 && (
                  <PreviewStat label="Median Pkg" value={formatLpa(c.medianPackage)} />
                )}
                {c.highestPlacementPercentage > 0 && (
                  <PreviewStat label="Top Branch %" value={`${c.highestPlacementPercentage.toFixed(0)}%`} />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-10 text-center text-sm font-semibold text-slate-500">
          Placement metrics are currently loading from records.
        </div>
      )}
    </section>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-xs font-bold text-slate-900">{value}</p>
    </div>
  );
}

/* â”€â”€â”€ PlacementResults (Table & FAQ Container) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function PlacementResults({
  data,
  year,
  yearData,
  selectedCollegeName
}: {
  data: any;
  year: number | null;
  yearData: any;
  selectedCollegeName: string | null;
}) {
  const summary = summarizePlacementYear(yearData);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortField, setSortField] = useState<string>("placementPercentage");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Branch placements array
  const rawPlacements = yearData?.placements || [];

  // Filter and Sort branch data
  const processedPlacements = useMemo(() => {
    let result = [...rawPlacements];

    // Local Search Filter
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      result = result.filter(p => p.branch?.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Convert to number for safety
      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });

    return result;
  }, [rawPlacements, filterQuery, sortField, sortAsc]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending
    }
  };

  const topBranch = rawPlacements.length > 0 
    ? [...rawPlacements].sort((a: any, b: any) => b.placementPercentage - a.placementPercentage)[0]
    : null;

  const showHighestCol = useMemo(() => {
    return rawPlacements.some((p: any) => p.highestPackage > 0);
  }, [rawPlacements]);

  const showAverageCol = useMemo(() => {
    return rawPlacements.some((p: any) => p.averagePackage > 0);
  }, [rawPlacements]);

  const showPlacedCol = useMemo(() => {
    return rawPlacements.some((p: any) => p.placementPercentage > 0);
  }, [rawPlacements]);

  const hasTableData = showHighestCol || showAverageCol || showPlacedCol;

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-12 items-start">
        {/* Left Column: Metrics & Charts Dashboard */}
        <div className={rawPlacements.length > 0 && hasTableData ? "lg:col-span-7" : "lg:col-span-12"}>
          <PlacementAnalytics 
            data={data} 
            selectedCollegeName={selectedCollegeName} 
            year={year} 
            yearData={yearData} 
          />
        </div>

        {/* Right Column: Branch details table (lg:col-span-5) */}
        {rawPlacements.length > 0 && hasTableData && (
          <div className="lg:col-span-5">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Table Header Section with Search Filter */}
              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Branch Details</h3>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Ranked by placement rate</p>
                </div>
                
                {/* Table Search Input */}
                <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/10">
                  <Filter className="h-3 w-3 text-slate-400 mr-1.5" />
                  <input
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter branch..."
                    className="bg-transparent text-[11px] font-bold text-slate-700 outline-none placeholder:text-slate-400 w-24"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3 cursor-pointer hover:text-slate-900 transition" onClick={() => toggleSort("branch")}>
                        <div className="flex items-center gap-1">
                          Branch
                          <ArrowUpDown size={10} />
                        </div>
                      </th>
                      {showHighestCol && (
                        <th className="px-4 py-3 cursor-pointer hover:text-slate-900 transition text-right" onClick={() => toggleSort("highestPackage")}>
                          <div className="flex items-center gap-1 justify-end">
                            Highest
                            <ArrowUpDown size={10} />
                          </div>
                        </th>
                      )}
                      {showAverageCol && (
                        <th className="px-4 py-3 cursor-pointer hover:text-slate-900 transition text-right" onClick={() => toggleSort("averagePackage")}>
                          <div className="flex items-center gap-1 justify-end">
                            Average
                            <ArrowUpDown size={10} />
                          </div>
                        </th>
                      )}
                      {showPlacedCol && (
                        <th className="px-4 py-3 cursor-pointer hover:text-slate-900 transition text-right" onClick={() => toggleSort("placementPercentage")}>
                          <div className="flex items-center gap-1 justify-end">
                            Placed
                            <ArrowUpDown size={10} />
                          </div>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence initial={false}>
                      {processedPlacements.map((p: any, i: number) => {
                        const isTop = topBranch && p.branch === topBranch.branch;
                        return (
                          <motion.tr 
                            key={p.branch} 
                            layoutId={`row-${p.branch}`}
                            className={`transition hover:bg-slate-50/50 ${isTop ? "bg-indigo-50/20" : ""}`}
                          >
                            <td className="px-4 py-2.5 font-bold text-slate-400">{i + 1}</td>
                            <td className="px-4 py-2.5 font-bold text-slate-900">
                              <span className="flex items-center gap-1">
                                {p.branch}
                                {isTop && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[8px] font-black text-indigo-700 uppercase tracking-wide">
                                    <Award className="h-2 w-2" /> Top
                                  </span>
                                )}
                              </span>
                            </td>
                            {showHighestCol && (
                              <td className="px-4 py-2.5 text-right font-bold text-indigo-600">
                                {p.highestPackage > 0 ? `${p.highestPackage.toFixed(1)} LPA` : "â€”"}
                              </td>
                            )}
                            {showAverageCol && (
                              <td className="px-4 py-2.5 text-right font-bold text-slate-950">
                                {p.averagePackage > 0 ? `${p.averagePackage.toFixed(1)} LPA` : "â€”"}
                              </td>
                            )}
                            {showPlacedCol && (
                              <td className="px-4 py-2.5 text-right">
                                {p.placementPercentage > 0 ? (
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    p.placementPercentage >= 90 
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                      : p.placementPercentage >= 75 
                                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                                      : "bg-rose-50 text-rose-700 border border-rose-100"
                                  }`}>
                                    {p.placementPercentage}%
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-[10px] font-semibold">â€”</span>
                                )}
                              </td>
                            )}
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                    {processedPlacements.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs font-semibold text-slate-500 bg-slate-50/10">
                          No branches match your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* â”€â”€â”€ FAQs â”€â”€â”€ */}
      <PlacementFaqs data={data} yearData={yearData} />
    </div>
  );
}

/* â”€â”€â”€ FAQs Accordion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function PlacementFaqs({ data, yearData }: { data: any; yearData: any }) {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const faqs = useMemo(() => {
    const summaries = summarizeAllYears(data?.yearlyPlacements || []);
    return buildPlacementFaqs({ data, yearData, summaries });
  }, [data, yearData]);

  if (!faqs.length) return null;

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md sm:p-8">
      <div className="mb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Questions & Answers</span>
        <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">Placement queries and answers</h3>
        <p className="text-xs font-semibold leading-relaxed text-slate-500 sm:text-sm">
          Dynamic metrics context answers mapped to this campus output
        </p>
      </div>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={faq.question} className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4.5 text-left transition hover:bg-slate-50/50"
            >
              <span className="text-sm font-bold text-slate-900 sm:text-base">{faq.question}</span>
              <ChevronDown className={`h-4.5 w-4.5 shrink-0 text-indigo-600 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4 text-sm font-semibold leading-relaxed text-slate-600">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

/* â”€â”€â”€ Visual Skeletons for Loading State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function PlacementSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-28 rounded-3xl border border-slate-200/60 bg-slate-100/50 p-5" />
        ))}
      </div>
      <div className="h-80 rounded-[1.75rem] border border-slate-200/60 bg-slate-100/50" />
    </div>
  );
}
