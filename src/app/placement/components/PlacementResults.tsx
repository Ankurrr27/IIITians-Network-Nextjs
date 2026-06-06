"use client";

import { useMemo, useState } from "react";
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
  selectedCollegeName,
}: PlacementResultsProps) {
  const summary = summarizePlacementYear(yearData);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortField, setSortField] = useState<string>("placementPercentage");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const rawPlacements = yearData?.placements || [];

  const processedPlacements = useMemo(() => {
    let result = [...rawPlacements];

    if (filterQuery.trim()) {
      const query = filterQuery.toLowerCase().trim();
      result = result.filter((placement: any) => placement.branch?.toLowerCase().includes(query));
    }

    result.sort((a: any, b: any) => {
      const valA = a[sortField];
      const valB = b[sortField];

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
      setSortAsc((value) => !value);
      return;
    }

    setSortField(field);
    setSortAsc(false);
  };

  const topBranch = rawPlacements.length > 0
    ? [...rawPlacements].sort((a: any, b: any) => b.placementPercentage - a.placementPercentage)[0]
    : null;

  const showHighestCol = useMemo(
    () => rawPlacements.some((placement: any) => placement.highestPackage > 0),
    [rawPlacements]
  );
  const showAverageCol = useMemo(
    () => rawPlacements.some((placement: any) => placement.averagePackage > 0),
    [rawPlacements]
  );
  const showPlacedCol = useMemo(
    () => rawPlacements.some((placement: any) => placement.placementPercentage > 0),
    [rawPlacements]
  );

  const hasTableData = showHighestCol || showAverageCol || showPlacedCol;

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <PlacementAnalytics
        data={data}
        selectedCollegeName={selectedCollegeName}
        year={year}
        yearData={yearData}
      />

      {rawPlacements.length > 0 && hasTableData && (
        <section className="ui-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Branch details</h3>
              <p className="mt-1 text-xs font-bold text-slate-400">Ranked by placement rate</p>
            </div>

            <div className="ui-control relative flex min-h-11 w-full items-center px-3.5 sm:w-64">
              <Filter className="mr-2 h-4 w-4 text-slate-400" />
              <input
                value={filterQuery}
                onChange={(event) => setFilterQuery(event.target.value)}
                placeholder="Filter branch..."
                className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/30 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <SortableHeader label="Branch" onClick={() => toggleSort("branch")} />
                  {showHighestCol && <SortableHeader label="Highest" align="right" onClick={() => toggleSort("highestPackage")} />}
                  {showAverageCol && <SortableHeader label="Average" align="right" onClick={() => toggleSort("averagePackage")} />}
                  {showPlacedCol && <SortableHeader label="Placed" align="right" onClick={() => toggleSort("placementPercentage")} />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                <AnimatePresence initial={false}>
                  {processedPlacements.map((placement: any, index: number) => {
                    const isTop = topBranch && placement.branch === topBranch.branch;
                    const pct = placement.placementPercentage;
                    const { barBg, pillBg, tier } = getPlacementTier(pct);

                    return (
                      <motion.tr
                        key={placement.branch}
                        layoutId={`row-${placement.branch}`}
                        className={`transition hover:bg-slate-50/60 ${isTop ? "bg-indigo-50/20" : ""}`}
                      >
                        <td className="px-6 py-5 font-black text-slate-400">{index + 1}</td>
                        <td className="px-6 py-5 font-black text-slate-950">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2">
                              {placement.branch}
                              {isTop && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-indigo-700">
                                  <Award className="h-2.5 w-2.5" /> Top
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-slate-400">{tier}</span>
                          </div>
                        </td>
                        {showHighestCol && (
                          <td className="px-6 py-5 text-right font-extrabold text-indigo-600">
                            {placement.highestPackage > 0 ? `${placement.highestPackage.toFixed(1)} LPA` : "-"}
                          </td>
                        )}
                        {showAverageCol && (
                          <td className="px-6 py-5 text-right font-extrabold text-slate-900">
                            {placement.averagePackage > 0 ? `${placement.averagePackage.toFixed(1)} LPA` : "-"}
                          </td>
                        )}
                        {showPlacedCol && (
                          <td className="px-6 py-5 text-right">
                            <div className="flex flex-col items-end gap-2">
                              {placement.placementPercentage > 0 ? (
                                <>
                                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${pillBg}`}>
                                    {placement.placementPercentage}%
                                  </span>
                                  <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 sm:block">
                                    <div className={`h-full rounded-full ${barBg}`} style={{ width: `${pct}%` }} />
                                  </div>
                                </>
                              ) : (
                                <span className="font-bold text-slate-400">-</span>
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
                    <td colSpan={5} className="bg-slate-50/10 py-12 text-center text-xs font-bold text-slate-400">
                      No departments match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <PlacementFaqs data={data} yearData={yearData} />
    </div>
  );
}

function SortableHeader({
  label,
  align = "left",
  onClick,
}: {
  label: string;
  align?: "left" | "right";
  onClick: () => void;
}) {
  return (
    <th
      className={`cursor-pointer px-6 py-4 transition hover:text-slate-900 ${align === "right" ? "text-right" : ""}`}
      onClick={onClick}
    >
      <div className={`flex items-center gap-1.5 ${align === "right" ? "justify-end" : ""}`}>
        {label}
        <ArrowUpDown size={12} />
      </div>
    </th>
  );
}

function getPlacementTier(pct: number) {
  if (pct >= 90) {
    return {
      barBg: "bg-emerald-500",
      pillBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
      tier: "Tier 1",
    };
  }

  if (pct >= 75) {
    return {
      barBg: "bg-amber-500",
      pillBg: "bg-amber-50 text-amber-700 border-amber-100",
      tier: "Tier 2",
    };
  }

  return {
    barBg: "bg-rose-500",
    pillBg: "bg-rose-50 text-rose-700 border-rose-100",
    tier: "Tier 3",
  };
}
