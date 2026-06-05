"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/apiClient";
import {
  Building2, Search, Loader2, X, ArrowUpRight, GraduationCap, Info
} from "lucide-react";

// Import modular subcomponents
import YearSelector from "./components/YearSelector";
import PlacementPreview from "./components/PlacementPreview";
import CampusComparisonDashboard from "./components/CampusComparisonDashboard";
import PlacementResults from "./components/PlacementResults";
import PlacementSkeleton from "./components/PlacementSkeleton";
import PageHeader, { pageHeaderButtonClass } from "@/components/PageHeader";

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

  // Comparison State
  const [isComparing, setIsComparing] = useState(false);
  const [compareCollege, setCompareCollege] = useState("");
  const [compareData, setCompareData] = useState<any>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

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
    // Clear comparison when a new search is made
    setIsComparing(false);
    setCompareCollege("");
    setCompareData(null);
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

  // Perform College Comparison Fetch
  const handleCompareSelect = async (compareName: string) => {
    if (!compareName || loadingCompare) return;
    setCompareCollege(compareName);
    setLoadingCompare(true);
    try {
      const res = await api.get(`/placements/college-name/${encodeURIComponent(compareName)}`);
      setCompareData(res.data);
    } catch {
      setCompareData(null);
    } finally {
      setLoadingCompare(false);
    }
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
    <div className="relative min-h-screen bg-[linear-gradient(180deg,#f3f6fc_0%,#eff4fb_25%,#ffffff_100%)] pb-20 pt-28 text-slate-900 sm:pb-28 sm:pt-32">
      {/* Decorative Floating Meshes & Ambient Background Auras */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] top-[5%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)] blur-2xl" />
        <div className="absolute -right-[10%] top-[15%] h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.08)_0%,transparent_70%)] blur-2xl" />
        <div className="absolute left-[30%] bottom-[10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.04)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 sm:space-y-12 sm:px-6">
        
        {/* ─── HERO HEADER ─── */}
        <PageHeader
          title={selectedCollegeName ? `${selectedCollegeName} Insights` : "Explore & Compare IIIT Placements"}
          description="Detailed branch-wise packages, percentage statistics, placement ratings, and historical timelines across IIITs."
          searchControl={
            <div className="relative">
              <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
                <Search size={18} className="shrink-0 text-slate-400" />
                <input
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  onKeyDown={(e) => e.key === "Enter" && searchCollege(college)}
                  placeholder="Search IIIT by name or city..."
                  disabled={loading}
                  className="h-full w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />
                {college && (
                  <button
                    onClick={() => { setCollege(""); setData(null); setSearched(false); setIsComparing(false); setCompareData(null); }}
                    className="rounded-full bg-slate-100 p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"
                  >
                    {filteredSuggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setCollege(item); searchCollege(item); }}
                        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-indigo-50/50 hover:text-indigo-700"
                      >
                        <span>{item}</span>
                        <ArrowUpRight size={14} className="text-slate-300" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          }
          filters={data ? (
            <YearSelector
              years={data.yearlyPlacements.map((i: any) => i.year)}
              value={year}
              onChange={handleYearChange}
            />
          ) : (
            <span className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500">
              All years
            </span>
          )}
          actions={
            <>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Top Searches:</span>
              {QUICK_CAMPUSES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => { setCollege(name); searchCollege(name); }}
                  className={`${pageHeaderButtonClass} h-10 text-xs ${
                    college === name
                      ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
                      : ""
                  }`}
                >
                  {name}
                </button>
              ))}
            </>
          }
        />

        {/* ─── COMPARISON TOGGLE BUTTON ─── */}
        {data && !loading && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setIsComparing(!isComparing);
                if (isComparing) {
                  setCompareCollege("");
                  setCompareData(null);
                }
              }}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-wider transition-all ${
                isComparing 
                  ? "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100" 
                  : "bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50/50 shadow-sm"
              }`}
            >
              {isComparing ? (
                <>
                  <X size={14} /> Exit Comparison
                </>
              ) : (
                <>
                  <GraduationCap size={14} /> Compare with another IIIT
                </>
              )}
            </button>
          </div>
        )}

        {/* ─── COMPARATIVE VIEW COMPONENT ─── */}
        <AnimatePresence>
          {isComparing && data && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-3xl border border-indigo-100 bg-indigo-50/20 p-5 sm:p-7 space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    Campus Comparison Engine
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Select an institute to contrast stats side-by-side with {selectedCollegeName}.</p>
                </div>

                <div className="max-w-md">
                  <select
                    value={compareCollege}
                    onChange={(e) => handleCompareSelect(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 shadow-sm"
                  >
                    <option value="">Choose campus to compare...</option>
                    {collegeOptions
                      .filter((name) => name !== selectedCollegeName)
                      .map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))
                    }
                  </select>
                </div>

                {loadingCompare && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  </div>
                )}

                {compareData && !loadingCompare && (
                  <CampusComparisonDashboard 
                    primaryName={selectedCollegeName!} 
                    primaryData={data} 
                    primaryYear={year}
                    compareName={compareCollege} 
                    compareData={compareData} 
                  />
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ─── DYNAMIC CONTENT DASHBOARD ─── */}
        {loading && <PlacementSkeleton />}

        {!searched && !loading && (
          <PlacementPreview onSelectCollege={(name) => searchCollege(name, null)} />
        )}

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
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Info className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900">No placements data found</h3>
            <p className="mt-1 max-w-sm text-sm font-bold text-slate-500">
              We couldn't retrieve records for "{college}". Please search another campus.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
