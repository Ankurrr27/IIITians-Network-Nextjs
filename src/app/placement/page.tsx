"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Calendar, ChevronDown, Loader2, Search, ArrowUpRight, Award } from "lucide-react";
import api from "@/lib/apiClient";
import {
  formatLpa, summarizePlacementYear, summarizeAllYears,
  summarizePlacementCollection, buildPlacementFaqs,
  type YearSummary, type YearlyPlacement,
} from "@/lib/placementInsights";

export default function PlacementPage() {
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
      const res = await api.get(`/placements/college/${encodeURIComponent(name)}`);
      setData(res.data);
      const years = (res.data.yearlyPlacements || []).map((e: any) => e.year);
      let nextYear = targetYear || year;
      if (!nextYear || !years.includes(nextYear)) nextYear = years.length ? Math.max(...years) : null;
      setYear(nextYear);
    } catch {
      setData(null);
      setYear(null);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (y: number | null) => setYear(y);

  const yearData = year ? data?.yearlyPlacements?.find((y2: any) => y2.year === year) : null;
  const selectedCollegeName = data?.college?.name || (searched ? college : null);

  const filteredSuggestions = useMemo(() => {
    const n = college.trim().toLowerCase();
    if (!n) return collegeOptions.slice(0, 6);
    return collegeOptions.filter((s) => s.toLowerCase().includes(n)).slice(0, 6);
  }, [collegeOptions, college]);

  const showSuggestions = isFocused && filteredSuggestions.length > 0 && !loading;

  return (
    <div className="relative min-h-screen bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)] pb-14 pt-20 text-slate-900 sm:pb-20 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-7 px-4 sm:space-y-10 sm:px-6">
        {/* Header */}
        <header className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 shadow-sm">
            <Building2 className="h-4 w-4" />
            Placement Insights
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {selectedCollegeName ? `${selectedCollegeName} placements` : "Compare IIIT placements"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Explore branch-wise performance, yearly package movement, and placement FAQs generated from visible data.
          </p>
        </header>

        {/* Search bar */}
        <section className={`grid gap-3 sm:gap-4 ${searched ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto]" : "grid-cols-1"}`}>
          <div className="w-full">
            <div className="relative rounded-[1rem] border border-slate-200 bg-white px-3 py-3 transition focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/20 sm:px-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <Search size={18} className="shrink-0 text-gray-400" />
                  <input
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 120)}
                    onKeyDown={(e) => e.key === "Enter" && searchCollege(college)}
                    placeholder="Search IIIT by name"
                    disabled={loading}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                  />
                </div>
                <button
                  onClick={() => searchCollege(college)}
                  disabled={loading || !college?.trim()}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 sm:w-auto"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
                </button>
              </div>
              {showSuggestions && (
                <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                  {filteredSuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setCollege(item); searchCollege(item); }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-indigo-700"
                    >
                      <span>{item}</span>
                      <span className="text-xs text-slate-400">View stats</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Year selector */}
          {data && (
            <div className="flex items-center">
              <YearSelector
                years={data.yearlyPlacements.map((i: any) => i.year)}
                value={year}
                onChange={handleYearChange}
              />
            </div>
          )}
        </section>

        {/* Preview (before search) */}
        {!searched && <PlacementPreview />}

        {/* Snapshot */}
        {data && <PlacementSnapshot data={data} />}

        {/* Results */}
        {data && !loading && yearData && (
          <PlacementResults data={data} year={year} yearData={yearData} selectedCollegeName={selectedCollegeName} />
        )}

        {searched && !loading && !data && (
          <p className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
            No placement data found.
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── YearSelector ───────────────────────────────────────────────────────── */
function YearSelector({ years = [], value, onChange }: { years: number[]; value: number | null; onChange: (y: number | null) => void }) {
  if (!years.length) return null;
  const sorted = [...years].sort((a, b) => b - a);
  const latest = sorted[0];
  return (
    <div className="w-full rounded-[1.15rem] border bg-white p-3 shadow-sm transition hover:border-indigo-400 sm:w-auto sm:px-4 sm:py-2">
      <div className="flex items-center gap-2">
        <Calendar size={18} className="shrink-0 text-indigo-600" />
        <span className="text-xs font-medium text-gray-700 sm:text-sm">Year</span>
      </div>
      <select
        value={value === null ? "all" : value}
        onChange={(e) => onChange(e.target.value === "all" ? null : Number(e.target.value))}
        className="mt-2 w-full cursor-pointer bg-transparent py-1 text-sm font-semibold text-gray-900 outline-none sm:mt-0 sm:w-auto"
      >
        <option value={latest}>{latest} - Latest</option>
        {sorted.filter((y) => y !== latest).map((y) => <option key={y} value={y}>{y}</option>)}
        <option value="all">All Years</option>
      </select>
    </div>
  );
}

/* ─── PlacementPreview ───────────────────────────────────────────────────── */
function PlacementPreview() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/placements").then((res) => {
      setItems(summarizePlacementCollection(res.data || []).slice(0, 6));
    }).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-8 lg:p-10">
      <div className="text-left sm:text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">Explore Before You Compare</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-3xl">Explore IIIT placement insights</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:mx-auto sm:text-base sm:leading-7">
          Search any IIIT to view branch-wise packages, placement rates, and a clearer year-wise story.
        </p>
      </div>
      {loading ? (
        <div className="mt-5 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-4"><div className="h-16 w-16 rounded-xl bg-white" /><div className="flex-1 space-y-2"><div className="h-4 w-3/4 rounded bg-slate-200" /><div className="h-3 w-1/2 rounded bg-slate-100" /></div></div>
              <div className="mt-4 grid grid-cols-2 gap-2"><div className="h-12 rounded-xl bg-white" /><div className="h-12 rounded-xl bg-white" /></div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {items.map((c: any) => (
            <div key={c.id} className="rounded-[1.15rem] border border-slate-200 bg-slate-50 p-3.5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm sm:rounded-[1.25rem] sm:p-4">
              <p className="text-sm font-semibold leading-tight text-slate-900 sm:text-base">{c.collegeName}</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">Latest year: {c.year}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                <PreviewStat label="Highest package" value={formatLpa(c.highestPackage)} />
                <PreviewStat label="Placement rate" value={`${c.placementRate.toFixed(1)}%`} />
                <PreviewStat label="Median package" value={formatLpa(c.medianPackage)} />
                <PreviewStat label="Highest placement" value={`${c.highestPlacementPercentage.toFixed(1)}%`} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500 sm:mt-8">
          Placement previews will appear here once colleges have real records.
        </div>
      )}
    </section>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-2.5 py-2 sm:px-3 sm:py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-slate-900 sm:text-sm">{value}</p>
    </div>
  );
}

/* ─── PlacementSnapshot ──────────────────────────────────────────────────── */
function PlacementSnapshot({ data }: { data: any }) {
  const summaries = summarizeAllYears(data?.yearlyPlacements || []);
  const latest = summaries[0];
  const previous = summaries[1];
  if (!latest) return null;
  const delta = previous ? latest.placementRate - previous.placementRate : null;

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 shadow-sm sm:rounded-[1.75rem] sm:p-8">
      <div className="mb-5 sm:mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">Placement Snapshot</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900 sm:text-2xl">Overall placement story</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 sm:leading-7">Consolidated performance for {latest.year}.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
        <Stat label="Students covered" value={latest.totalStudents} />
        <Stat label="Students placed" value={latest.studentsPlaced} />
        <Stat label="Weighted average" value={formatLpa(latest.averagePackage)} />
        <Stat label="Highest package" value={formatLpa(latest.highestPackage)} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <InsightCard label="Placement rate" value={`${latest.placementRate.toFixed(1)}%`}
          note={delta === null ? "First recorded comparison point." : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts vs ${previous!.year}`} />
        <InsightCard label="Top branch" value={latest.topBranch?.branch || "N/A"}
          note={latest.topBranch ? `${latest.topBranch.placementPercentage.toFixed(1)}% placement rate` : "No branch-level summary."} />
        <InsightCard label="Branches reported" value={latest.branchCount} note={`Across ${latest.year}`} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-3.5 shadow-sm sm:p-4">
      <p className="text-[11px] text-slate-500 sm:text-xs">{label}</p>
      <p className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">{String(value)}</p>
    </div>
  );
}

function InsightCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white/85 p-3.5 sm:p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-900 sm:text-lg">{String(value)}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">{note}</p>
    </div>
  );
}

/* ─── PlacementResults ───────────────────────────────────────────────────── */
function PlacementResults({ data, year, yearData, selectedCollegeName }: { data: any; year: number | null; yearData: any; selectedCollegeName: string | null }) {
  const summary = summarizePlacementYear(yearData);
  if (!summary) return null;

  const sorted = [...(yearData?.placements || [])].sort((a: any, b: any) => b.placementPercentage - a.placementPercentage);
  const topBranch = sorted[0];

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Highest package" value={formatLpa(summary.highestPackage)} note="Best reported offer" accent="from-indigo-500/15 to-indigo-50" />
        <StatCard title="Weighted average" value={formatLpa(summary.averagePackage)} note="Weighted using total students" accent="from-emerald-500/12 to-emerald-50" />
        <StatCard title="Median package" value={formatLpa(summary.medianPackage)} note="Median of branch averages" accent="from-amber-500/12 to-amber-50" />
        <StatCard title="Highest placement" value={`${summary.highestPlacementPercentage.toFixed(1)}%`}
          note={summary.topBranch ? `${summary.topBranch.branch} leads` : `${summary.studentsPlaced}/${summary.totalStudents} placed`}
          accent="from-sky-500/12 to-sky-50" />
      </div>

      {/* Table */}
      {sorted.length > 0 && (
        <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm sm:border sm:rounded-2xl">
          <div className="border-b px-4 py-4 sm:px-6">
            <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Branch-wise Placement Details</h3>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">Ranked by placement percentage</p>
          </div>
          <div className="-mx-1 overflow-x-auto p-4 sm:mx-0 sm:p-6">
            <table className="min-w-[560px] w-full text-xs sm:min-w-[640px] sm:text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3 text-left font-medium">#</th>
                  <th className="p-3 text-left font-medium">Branch</th>
                  <th className="p-3 text-right font-medium">Highest</th>
                  <th className="p-3 text-right font-medium">Average</th>
                  <th className="p-3 text-right font-medium">Placed %</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p: any, i: number) => {
                  const isTop = p.branch === topBranch?.branch;
                  return (
                    <tr key={p.branch} className={`border-t transition ${isTop ? "bg-indigo-50/40" : "hover:bg-gray-50"}`}>
                      <td className="p-3 font-semibold text-gray-500">{i + 1}</td>
                      <td className="flex items-center gap-1 p-3 font-medium text-gray-900">
                        {p.branch}
                        {isTop && <span className="text-indigo-600"><Award size={12} /></span>}
                      </td>
                      <td className="whitespace-nowrap p-3 text-right font-semibold text-indigo-600">{p.highestPackage} LPA</td>
                      <td className="whitespace-nowrap p-3 text-right text-gray-800">{p.averagePackage} LPA</td>
                      <td className="p-3 text-right">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
                          p.placementPercentage >= 90 ? "bg-green-100 text-green-700"
                            : p.placementPercentage >= 70 ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {p.placementPercentage}%
                          {p.placementPercentage >= 90 && <ArrowUpRight size={11} />}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAQs */}
      <PlacementFaqs data={data} yearData={yearData} />
    </div>
  );
}

function StatCard({ title, value, note, accent }: { title: string; value: string; note: string; accent: string }) {
  return (
    <div className={`rounded-[1.5rem] border border-slate-200 bg-gradient-to-br ${accent} p-5 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{title}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
    </div>
  );
}

/* ─── PlacementFaqs ──────────────────────────────────────────────────────── */
function PlacementFaqs({ data, yearData }: { data: any; yearData: any }) {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = useMemo(() => {
    const summaries = summarizeAllYears(data?.yearlyPlacements || []);
    return buildPlacementFaqs({ data, yearData, summaries });
  }, [data, yearData]);

  if (!faqs.length) return null;

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">Placement FAQs</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">Questions students usually ask</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        These answers change with the selected college and year.
      </p>
      <div className="mt-5 space-y-3">
        {faqs.map((faq, i) => (
          <div key={faq.question} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <button type="button" onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left">
              <span className="text-sm font-medium text-slate-900 sm:text-base">{faq.question}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-indigo-600 transition ${openIndex === i ? "rotate-180" : ""}`} />
            </button>
            {openIndex === i && (
              <div className="border-t border-slate-200 px-4 py-4 text-sm leading-7 text-slate-600">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
