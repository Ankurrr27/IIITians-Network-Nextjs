"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Filter, ArrowUpDown } from "lucide-react";
import { summarizePlacementYear } from "@/lib/placementInsights";
import PlacementAnalytics from "../sections/PlacementAnalytics";
import PlacementFaqs from "./PlacementFaqs";

interface PlacementResultsProps {
  data: any;
  year: number | null;
  yearData: any;
  selectedCollegeName: string | null;
}

export default function PlacementResults({
  data,
  year,
  yearData,
  selectedCollegeName
}: PlacementResultsProps) {
  const summary = summarizePlacementYear(yearData);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortField, setSortField] = useState<string>("placementPercentage");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Branch placements array
  const rawPlacements = yearData?.placements || [];

  // Filter and Sort branch data
  const processedPlacements = useMemo(() => {
    let result = [...rawPlacements];

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      result = result.filter(p => p.branch?.toLowerCase().includes(q));
    }

    result.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

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
      setSortAsc(false); // default desc
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
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* Left Column: Visual Analytics Dashboard */}
        <div className={rawPlacements.length > 0 && hasTableData ? "lg:col-span-7" : "lg:col-span-12"}>
          <PlacementAnalytics 
            data={data} 
            selectedCollegeName={selectedCollegeName} 
            year={year} 
            yearData={yearData} 
          />
        </div>

        {/* Right Column: Branch placements table */}
        {rawPlacements.length > 0 && hasTableData && (
          <div className="lg:col-span-5">
            <section className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
              
              {/* Table Toolbar Header with Search Filter */}
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Branch details</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Ranked by placement rate</p>
                </div>
                
                {/* Search / Filter Input */}
                <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/10">
                  <Filter className="h-3 w-3 text-slate-400 mr-2" />
                  <input
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter branch..."
                    className="bg-transparent text-[11px] font-bold text-slate-700 outline-none placeholder:text-slate-400 w-24"
                  />
                </div>
              </div>

              {/* Placements Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3.5">#</th>
                      <th className="px-5 py-3.5 cursor-pointer hover:text-slate-900 transition" onClick={() => toggleSort("branch")}>
                        <div className="flex items-center gap-1.5">
                          Branch
                          <ArrowUpDown size={10} />
                        </div>
                      </th>
                      {showHighestCol && (
                        <th className="px-5 py-3.5 cursor-pointer hover:text-slate-900 transition text-right" onClick={() => toggleSort("highestPackage")}>
                          <div className="flex items-center gap-1.5 justify-end">
                            Highest
                            <ArrowUpDown size={10} />
                          </div>
                        </th>
                      )}
                      {showAverageCol && (
                        <th className="px-5 py-3.5 cursor-pointer hover:text-slate-900 transition text-right" onClick={() => toggleSort("averagePackage")}>
                          <div className="flex items-center gap-1.5 justify-end">
                            Average
                            <ArrowUpDown size={10} />
                          </div>
                        </th>
                      )}
                      {showPlacedCol && (
                        <th className="px-5 py-3.5 cursor-pointer hover:text-slate-900 transition text-right" onClick={() => toggleSort("placementPercentage")}>
                          <div className="flex items-center gap-1.5 justify-end">
                            Placed
                            <ArrowUpDown size={10} />
                          </div>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                    <AnimatePresence initial={false}>
                      {processedPlacements.map((p: any, i: number) => {
                        const isTop = topBranch && p.branch === topBranch.branch;
                        const pct = p.placementPercentage;

                        // Visual progress bar theme
                        let barBg = "bg-rose-500";
                        let pillBg = "bg-rose-50 text-rose-700 border-rose-100";
                        let tier = "Tier 3";
                        if (pct >= 90) {
                          barBg = "bg-emerald-500";
                          pillBg = "bg-emerald-50 text-emerald-700 border-emerald-100";
                          tier = "Tier 1";
                        } else if (pct >= 75) {
                          barBg = "bg-amber-500";
                          pillBg = "bg-amber-50 text-amber-700 border-amber-100";
                          tier = "Tier 2";
                        }

                        return (
                          <motion.tr 
                            key={p.branch} 
                            layoutId={`row-${p.branch}`}
                            className={`transition hover:bg-slate-50/40 ${isTop ? "bg-indigo-50/10" : ""}`}
                          >
                            <td className="px-5 py-3 text-slate-400 font-black">{i + 1}</td>
                            <td className="px-5 py-3 text-slate-950 font-black">
                              <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1.5">
                                  {p.branch}
                                  {isTop && (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[8px] font-black text-indigo-700 uppercase tracking-wide">
                                      <Award className="h-2 w-2" /> Top
                                    </span>
                                  )}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{tier}</span>
                              </div>
                            </td>
                            {showHighestCol && (
                              <td className="px-5 py-3 text-right text-indigo-600 font-extrabold">
                                {p.highestPackage > 0 ? `${p.highestPackage.toFixed(1)} LPA` : "—"}
                              </td>
                            )}
                            {showAverageCol && (
                              <td className="px-5 py-3 text-right text-slate-900 font-extrabold">
                                {p.averagePackage > 0 ? `${p.averagePackage.toFixed(1)} LPA` : "—"}
                              </td>
                            )}
                            {showPlacedCol && (
                              <td className="px-5 py-3 text-right">
                                <div className="flex flex-col items-end gap-1.5">
                                  {p.placementPercentage > 0 ? (
                                    <>
                                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${pillBg}`}>
                                        {p.placementPercentage}%
                                      </span>
                                      <div className="h-1 w-16 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                                        <div className={`h-full rounded-full ${barBg}`} style={{ width: `${pct}%` }} />
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 font-bold">—</span>
                                  )}
                                </div>
                              </td>
                            )}
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                    {processedPlacements.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs font-bold text-slate-400 bg-slate-50/10">
                          No departments match your filter.
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

      {/* FAQs */}
      <PlacementFaqs data={data} yearData={yearData} />
    </div>
  );
}
