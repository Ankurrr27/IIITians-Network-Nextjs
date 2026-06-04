"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import { TrendingUp, Award, Users, Percent, CheckCircle, HelpCircle, Briefcase } from "lucide-react";
import { formatLpa, summarizePlacementYear, summarizeAllYears, type YearSummary } from "@/lib/placementInsights";
import type { IPlacement, YearlyPlacement, BranchPlacement } from "@/types";

interface PlacementAnalyticsProps {
  data: IPlacement | null;
  selectedCollegeName: string | null;
  year: number | null;
  yearData: YearlyPlacement | null;
}

const COLORS = ["#6366f1", "#e2e8f0"];

export default function PlacementAnalytics({
  data,
  selectedCollegeName,
  year,
  yearData,
}: PlacementAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<string>("");

  // 1. Process Summaries
  const summaries: YearSummary[] = useMemo(() => {
    if (!data?.yearlyPlacements) return [];
    return summarizeAllYears(data.yearlyPlacements);
  }, [data]);

  const currentSummary = useMemo(() => {
    if (!yearData) return null;
    return summarizePlacementYear(yearData);
  }, [yearData]);

  // 2. Determine which metrics/charts are valid based on non-missing data
  const hasPlacementRate = currentSummary && currentSummary.placementRate > 0;
  const hasHighestPkg = currentSummary && currentSummary.highestPackage > 0;
  const hasAvgPkg = currentSummary && currentSummary.averagePackage > 0;
  const hasMedianPkg = currentSummary && currentSummary.medianPackage > 0;
  const hasStudentsCount = currentSummary && currentSummary.totalStudents > 0 && currentSummary.studentsPlaced > 0;

  // Yearly Growth Data Validation
  const growthData = useMemo(() => {
    if (summaries.length < 2) return [];
    return [...summaries]
      .sort((a, b) => a.year - b.year)
      .map((s) => ({
        year: s.year,
        placementRate: s.placementRate > 0 ? parseFloat(s.placementRate.toFixed(1)) : null,
        avgPackage: s.averagePackage > 0 ? parseFloat(s.averagePackage.toFixed(2)) : null,
        highestPackage: s.highestPackage > 0 ? parseFloat(s.highestPackage.toFixed(2)) : null,
      }));
  }, [summaries]);

  const hasGrowthTrends = useMemo(() => {
    return growthData.length >= 2 && growthData.some(d => d.avgPackage !== null || d.placementRate !== null);
  }, [growthData]);

  // Branch Performance Validation
  const branchData = useMemo(() => {
    if (!yearData?.placements) return [];
    return yearData.placements
      .map((p) => ({
        branch: p.branch || "Unknown",
        placementRate: p.placementPercentage > 0 ? parseFloat(p.placementPercentage.toFixed(1)) : null,
        avgPackage: p.averagePackage > 0 ? parseFloat(p.averagePackage.toFixed(2)) : null,
        highestPackage: p.highestPackage > 0 ? parseFloat(p.highestPackage.toFixed(2)) : null,
      }))
      .sort((a, b) => (b.placementRate || 0) - (a.placementRate || 0));
  }, [yearData]);

  const hasBranchComparison = useMemo(() => {
    return branchData.length > 0 && branchData.some(b => b.placementRate !== null || b.avgPackage !== null);
  }, [branchData]);

  // Placed Ratio Pie Chart Data
  const pieData = useMemo(() => {
    if (!currentSummary || !hasStudentsCount) return [];
    const placed = currentSummary.studentsPlaced;
    const unplaced = Math.max(0, currentSummary.totalStudents - placed);
    const total = currentSummary.totalStudents;
    return [
      { name: "Placed Students", value: placed, percentage: ((placed / total) * 100).toFixed(1) },
      { name: "Unplaced Students", value: unplaced, percentage: ((unplaced / total) * 100).toFixed(1) },
    ];
  }, [currentSummary, hasStudentsCount]);

  // 3. Setup Tabs Dynamically based on available charts
  const availableTabs = useMemo(() => {
    const tabs = [];
    if (hasBranchComparison) {
      tabs.push({ id: "branch", label: "Branch Breakdown" });
    }
    if (hasGrowthTrends) {
      tabs.push({ id: "trends", label: "Historical Trends" });
    }
    if (pieData.length > 0) {
      tabs.push({ id: "ratio", label: "Placement Ratio" });
    }
    return tabs;
  }, [hasBranchComparison, hasGrowthTrends, pieData]);

  // Auto-select tab when data loads or switches
  useEffect(() => {
    if (availableTabs.length > 0) {
      // If current active tab is not in the list of available tabs, pick the first one
      if (!availableTabs.some(t => t.id === activeTab)) {
        setActiveTab(availableTabs[0].id);
      }
    } else {
      setActiveTab("");
    }
  }, [availableTabs, activeTab]);

  if (!currentSummary) return null;

  return (
    <div className="space-y-5">
      {/* ─── METRICS STATS DASHBOARD ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Placement Rate Circular Chart */}
        {hasPlacementRate && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md duration-200"
          >
            <div className="space-y-0.5 min-w-0">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Percent className="h-3 w-3 text-indigo-600" />
                Placement Rate
              </span>
              <p className="text-2xl font-extrabold tracking-tight text-slate-900 truncate">
                {currentSummary.placementRate.toFixed(1)}%
              </p>
              <p className="text-[10px] font-semibold text-slate-500 truncate">
                {currentSummary.studentsPlaced}/{currentSummary.totalStudents} placed
              </p>
            </div>
            
            {/* Visual SVG Progress Ring */}
            <div className="relative flex h-13 w-13 shrink-0 items-center justify-center">
              <svg className="absolute h-full w-full -rotate-90">
                <circle
                  cx="26"
                  cy="26"
                  r="21"
                  className="stroke-slate-100 fill-none"
                  strokeWidth="4"
                />
                <circle
                  cx="26"
                  cy="26"
                  r="21"
                  className="stroke-indigo-600 fill-none"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 21}
                  strokeDashoffset={2 * Math.PI * 21 * (1 - currentSummary.placementRate / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[10px] font-extrabold text-indigo-700">
                {Math.round(currentSummary.placementRate)}%
              </span>
            </div>
          </motion.div>
        )}

        {/* Highest Package */}
        {hasHighestPkg && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md duration-200"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Award className="h-3 w-3 text-rose-500" />
                Highest Offer
              </span>
              <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">Max</span>
            </div>
            <div className="mt-2.5">
              <p className="text-2xl font-extrabold tracking-tight text-slate-900 truncate">
                {formatLpa(currentSummary.highestPackage)}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-500 truncate">
                {currentSummary.topBranch ? `Lead: ${currentSummary.topBranch.branch}` : "Across branches"}
              </p>
            </div>
          </motion.div>
        )}

        {/* Average Package */}
        {hasAvgPkg && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md duration-200"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Briefcase className="h-3 w-3 text-emerald-500" />
                Avg Package
              </span>
              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">Mean</span>
            </div>
            <div className="mt-2.5">
              <p className="text-2xl font-extrabold tracking-tight text-slate-900 truncate">
                {formatLpa(currentSummary.averagePackage)}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-500 truncate">
                Across {currentSummary.branchCount} branches
              </p>
            </div>
          </motion.div>
        )}

        {/* Median Package */}
        {hasMedianPkg && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md duration-200"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <TrendingUp className="h-3 w-3 text-amber-500" />
                Median Pkg
              </span>
              <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Median</span>
            </div>
            <div className="mt-2.5">
              <p className="text-2xl font-extrabold tracking-tight text-slate-900 truncate">
                {formatLpa(currentSummary.medianPackage)}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-500 truncate">
                Departmental median value
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ─── YEAR-BY-YEAR COMPARISON ─── */}
      {summaries.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white/60 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
            Year-over-Year Snapshot
          </div>
          <div className="mt-2.5 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {summaries.map((s) => (
              <div 
                key={s.year} 
                className={`rounded-xl border p-2.5 transition duration-200 ${
                  s.year === year 
                    ? "border-indigo-200 bg-indigo-50/40 shadow-sm" 
                    : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{s.year}</span>
                  <span className="text-[9px] font-bold text-slate-400">{s.branchCount} branches</span>
                </div>
                <div className="mt-1.5 space-y-0.5 text-[11px] font-bold">
                  {s.averagePackage > 0 && (
                    <div className="flex justify-between gap-1">
                      <span className="text-slate-400 text-[10px] font-semibold">Avg:</span>
                      <span className="text-slate-800">{s.averagePackage.toFixed(1)} LPA</span>
                    </div>
                  )}
                  {s.highestPackage > 0 && (
                    <div className="flex justify-between gap-1">
                      <span className="text-slate-400 text-[10px] font-semibold">Max:</span>
                      <span className="text-slate-800">{s.highestPackage.toFixed(1)} LPA</span>
                    </div>
                  )}
                  {s.placementRate > 0 && (
                    <div className="flex justify-between gap-1">
                      <span className="text-slate-400 text-[10px] font-semibold">Placed:</span>
                      <span className="text-indigo-600">{s.placementRate.toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── CHARTS SECTION ─── */}
      {availableTabs.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">Visual Insights</h3>
              <p className="text-[10px] font-semibold text-slate-500 truncate">Analytics visualization for {selectedCollegeName}</p>
            </div>

            {/* TAB PILLS */}
            <div className="flex flex-wrap gap-0.5 rounded-lg bg-slate-100 p-0.5 self-start">
              {availableTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
                    activeTab === t.id
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 min-h-[260px]">
            <AnimatePresence mode="wait">
              {activeTab === "branch" && hasBranchComparison && (
                <motion.div
                  key="branch-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={branchData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="branch" stroke="#94a3b8" style={{ fontSize: "9px", fontWeight: 600 }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: "9px" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }}
                        formatter={(value: any, name: any) => {
                          if (name === "highestPackage") return [`${value} LPA`, "Highest Package"];
                          if (name === "avgPackage") return [`${value} LPA`, "Average Package"];
                          if (name === "placementRate") return [`${value}%`, "Placement Rate"];
                          return [value, name];
                        }}
                      />
                      <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: "10px", fontWeight: 600 }} />
                      {branchData.some(b => b.placementRate !== null) && (
                        <Bar dataKey="placementRate" name="Placement Rate" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={30} />
                      )}
                      {branchData.some(b => b.avgPackage !== null) && (
                        <Bar dataKey="avgPackage" name="Average Package" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={30} />
                      )}
                      {branchData.some(b => b.highestPackage !== null) && (
                        <Bar dataKey="highestPackage" name="Highest Package" fill="#ec4899" radius={[3, 3, 0, 0]} maxBarSize={30} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {activeTab === "trends" && hasGrowthTrends && (
                <motion.div
                  key="trends-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: "9px", fontWeight: 600 }} type="number" domain={["dataMin - 0.3", "dataMax + 0.3"]} tickCount={growthData.length} />
                      <YAxis yAxisId="left" stroke="#6366f1" style={{ fontSize: "9px" }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" style={{ fontSize: "9px" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }}
                        formatter={(value: any, name: any) => {
                          if (name === "placementRate") return [`${value}%`, "Placement Rate"];
                          if (name === "avgPackage") return [`${value} LPA`, "Average Package"];
                          if (name === "highestPackage") return [`${value} LPA`, "Highest Package"];
                          return [value, name];
                        }}
                      />
                      <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: "10px", fontWeight: 600 }} />
                      {growthData.some(d => d.placementRate !== null) && (
                        <Area yAxisId="left" type="monotone" dataKey="placementRate" name="Placement Rate" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" dot={{ fill: "#6366f1", r: 4 }} />
                      )}
                      {growthData.some(d => d.avgPackage !== null) && (
                        <Area yAxisId="right" type="monotone" dataKey="avgPackage" name="Average Package" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAvg)" dot={{ fill: "#10b981", r: 4 }} />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {activeTab === "ratio" && pieData.length > 0 && (
                <motion.div
                  key="ratio-tab"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-center justify-center gap-6 py-2 sm:flex-row"
                >
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }}
                        formatter={(value: any, name: string, prop: any) => [`${value} students (${prop.payload.percentage}%)`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Breakdown</h4>
                    {pieData.map((item, idx) => (
                      <div key={item.name} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                        <span>
                          {item.name}: <span className="font-extrabold text-slate-950">{item.value}</span>
                          <span className="text-[10px] text-slate-400 ml-1">({item.percentage}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
