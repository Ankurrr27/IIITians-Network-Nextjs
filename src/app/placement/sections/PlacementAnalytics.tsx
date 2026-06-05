"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import { TrendingUp, Award, Users, Percent, Briefcase } from "lucide-react";
import { formatLpa, summarizePlacementYear, summarizeAllYears, type YearSummary } from "@/lib/placementInsights";
import type { IPlacement, YearlyPlacement } from "@/types";

interface PlacementAnalyticsProps {
  data: IPlacement | null;
  selectedCollegeName: string | null;
  year: number | null;
  yearData: YearlyPlacement | null;
}

const COLORS = ["#4f46e5", "#cbd5e1"]; // Indigo primary, Slate secondary

// Sleek Custom Tooltip Component for Charts
function GlassTooltip({ active, payload, label, formatter }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-white/20 bg-slate-950/90 p-4 text-xs font-bold text-white shadow-2xl backdrop-blur-md">
        <p className="mb-2 text-slate-400">Record: {label}</p>
        <div className="space-y-1.5">
          {payload.map((item: any, idx: number) => {
            const formatted = formatter ? formatter(item.value, item.name, item) : `${item.value} ${item.name}`;
            return (
              <div key={idx} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
                <span className="text-white">
                  {formatted[1]}: <span className="font-extrabold text-indigo-400">{formatted[0]}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

export default function PlacementAnalytics({
  data,
  selectedCollegeName,
  year,
  yearData,
}: PlacementAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<string>("");

  // Process Summaries
  const summaries: YearSummary[] = useMemo(() => {
    if (!data?.yearlyPlacements) return [];
    return summarizeAllYears(data.yearlyPlacements);
  }, [data]);

  const currentSummary = useMemo(() => {
    if (!yearData) return null;
    return summarizePlacementYear(yearData);
  }, [yearData]);

  // Determine valid metrics
  const hasPlacementRate = currentSummary && currentSummary.placementRate > 0;
  const hasHighestPkg = currentSummary && currentSummary.highestPackage > 0;
  const hasAvgPkg = currentSummary && currentSummary.averagePackage > 0;
  const hasMedianPkg = currentSummary && currentSummary.medianPackage > 0;
  const hasStudentsCount = currentSummary && currentSummary.totalStudents > 0 && currentSummary.studentsPlaced > 0;

  // Yearly Growth Data
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

  // Branch Performance
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
      { name: "Placed", value: placed, percentage: ((placed / total) * 100).toFixed(1) },
      { name: "Unplaced", value: unplaced, percentage: ((unplaced / total) * 100).toFixed(1) },
    ];
  }, [currentSummary, hasStudentsCount]);

  // Available Tabs
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

  // Auto-select active tab
  useEffect(() => {
    if (availableTabs.length > 0) {
      if (!availableTabs.some(t => t.id === activeTab)) {
        setActiveTab(availableTabs[0].id);
      }
    } else {
      setActiveTab("");
    }
  }, [availableTabs, activeTab]);

  if (!currentSummary) return null;

  return (
    <div className="space-y-6">
      {/* ─── METRICS STATS DASHBOARD ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Placement Rate Circular Card */}
        {hasPlacementRate && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
          >
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-[radial-gradient(circle,_rgba(99,102,241,0.06),_transparent_70%)]" />
            <div className="space-y-1 min-w-0 z-10">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <Percent className="h-3.5 w-3.5 text-indigo-600" />
                Placement Rate
              </span>
              <p className="text-2xl font-black tracking-tight text-slate-900">
                {currentSummary.placementRate.toFixed(1)}%
              </p>
              <p className="text-[10px] font-bold text-indigo-600/70">
                {currentSummary.studentsPlaced}/{currentSummary.totalStudents} students placed
              </p>
            </div>
            
            {/* Visual SVG Progress Ring */}
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center z-10">
              <svg className="absolute h-full w-full -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  className="stroke-slate-100 fill-none"
                  strokeWidth="4"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  className="stroke-indigo-600 fill-none transition-all duration-1000 ease-out"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 23}
                  strokeDashoffset={2 * Math.PI * 23 * (1 - currentSummary.placementRate / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[10px] font-black text-indigo-700">
                {Math.round(currentSummary.placementRate)}%
              </span>
            </div>
          </motion.div>
        )}

        {/* Highest Package */}
        {hasHighestPkg && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl"
          >
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-[radial-gradient(circle,_rgba(244,63,94,0.06),_transparent_70%)]" />
            <div className="flex items-center justify-between gap-1 z-10 relative">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <Award className="h-3.5 w-3.5 text-rose-500" />
                Highest Offer
              </span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-black text-rose-700 uppercase tracking-wider">Max</span>
            </div>
            <div className="mt-3.5 z-10 relative">
              <p className="text-2xl font-black tracking-tight text-slate-900">
                {formatLpa(currentSummary.highestPackage)}
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-rose-600/70 truncate">
                {currentSummary.topBranch ? `Lead: ${currentSummary.topBranch.branch}` : "All branches"}
              </p>
            </div>
          </motion.div>
        )}

        {/* Average Package */}
        {hasAvgPkg && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
          >
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.06),_transparent_70%)]" />
            <div className="flex items-center justify-between gap-1 z-10 relative">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
                Avg Package
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700 uppercase tracking-wider">Mean</span>
            </div>
            <div className="mt-3.5 z-10 relative">
              <p className="text-2xl font-black tracking-tight text-slate-900">
                {formatLpa(currentSummary.averagePackage)}
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-emerald-600/70">
                Across {currentSummary.branchCount} branches
              </p>
            </div>
          </motion.div>
        )}

        {/* Median Package */}
        {hasMedianPkg && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl"
          >
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.06),_transparent_70%)]" />
            <div className="flex items-center justify-between gap-1 z-10 relative">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                Median Pkg
              </span>
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-700 uppercase tracking-wider">Median</span>
            </div>
            <div className="mt-3.5 z-10 relative">
              <p className="text-2xl font-black tracking-tight text-slate-900">
                {formatLpa(currentSummary.medianPackage)}
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-amber-600/70">
                Departmental median value
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ─── YEAR-BY-YEAR SNAPSHOTS ─── */}
      {summaries.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.6rem] border border-slate-200/80 bg-white/70 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)] backdrop-blur-md"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            Year-over-Year Snapshot
          </div>
          <div className="mt-3 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {summaries.map((s) => (
              <div 
                key={s.year} 
                className={`rounded-2xl border p-3.5 transition-all duration-300 ${
                  s.year === year 
                    ? "border-indigo-300 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/10 scale-102" 
                    : "border-slate-100 bg-white hover:bg-slate-50/50 hover:border-slate-200 hover:scale-101"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">{s.year}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-400">{s.branchCount} br.</span>
                </div>
                <div className="mt-2.5 space-y-1 text-xs font-bold">
                  {s.averagePackage > 0 && (
                    <div className="flex justify-between gap-1 text-slate-600">
                      <span className="font-medium text-slate-400">Avg:</span>
                      <span className="text-slate-800">{s.averagePackage.toFixed(1)} LPA</span>
                    </div>
                  )}
                  {s.highestPackage > 0 && (
                    <div className="flex justify-between gap-1 text-slate-600">
                      <span className="font-medium text-slate-400">Max:</span>
                      <span className="text-slate-800">{s.highestPackage.toFixed(1)} LPA</span>
                    </div>
                  )}
                  {s.placementRate > 0 && (
                    <div className="flex justify-between gap-1 text-slate-600">
                      <span className="font-medium text-slate-400">Placed:</span>
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
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Analytics visualization</h3>
              <p className="text-xs font-medium text-slate-500">Department metrics for {selectedCollegeName}</p>
            </div>

            {/* TAB SLIDING PILLS */}
            <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1.5 self-start">
              {availableTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition-all duration-300 ${
                    activeTab === t.id
                      ? "bg-slate-950 text-white shadow-md"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 min-h-[280px]">
            <AnimatePresence mode="wait">
              {activeTab === "branch" && hasBranchComparison && (
                <motion.div
                  key="branch-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={branchData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="branch" stroke="#94a3b8" style={{ fontSize: "10px", fontWeight: 700 }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: "10px" }} />
                      <Tooltip
                        content={<GlassTooltip />}
                        formatter={(value: any, name: any) => {
                          if (name === "highestPackage") return [`${value} LPA`, "Highest"];
                          if (name === "avgPackage") return [`${value} LPA`, "Average"];
                          if (name === "placementRate") return [`${value}%`, "Placement Rate"];
                          return [value, name];
                        }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px", fontWeight: 700 }} />
                      {branchData.some(b => b.placementRate !== null) && (
                        <Bar dataKey="placementRate" name="Placement Rate (%)" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      )}
                      {branchData.some(b => b.avgPackage !== null) && (
                        <Bar dataKey="avgPackage" name="Average Package (LPA)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      )}
                      {branchData.some(b => b.highestPackage !== null) && (
                        <Bar dataKey="highestPackage" name="Highest Package (LPA)" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {activeTab === "trends" && hasGrowthTrends && (
                <motion.div
                  key="trends-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="year" stroke="#94a3b8" style={{ fontSize: "10px", fontWeight: 700 }} type="number" domain={["dataMin - 0.2", "dataMax + 0.2"]} tickCount={growthData.length} />
                      <YAxis yAxisId="left" stroke="#4f46e5" style={{ fontSize: "10px" }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" style={{ fontSize: "10px" }} />
                      <Tooltip
                        content={<GlassTooltip />}
                        formatter={(value: any, name: any) => {
                          if (name === "placementRate") return [`${value}%`, "Placement Rate"];
                          if (name === "avgPackage") return [`${value} LPA`, "Average Package"];
                          if (name === "highestPackage") return [`${value} LPA`, "Highest Package"];
                          return [value, name];
                        }}
                      />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px", fontWeight: 700 }} />
                      {growthData.some(d => d.placementRate !== null) && (
                        <Area yAxisId="left" type="monotone" dataKey="placementRate" name="Placement Rate (%)" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRate)" dot={{ fill: "#4f46e5", r: 5 }} />
                      )}
                      {growthData.some(d => d.avgPackage !== null) && (
                        <Area yAxisId="right" type="monotone" dataKey="avgPackage" name="Average Package (LPA)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAvg)" dot={{ fill: "#10b981", r: 5 }} />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {activeTab === "ratio" && pieData.length > 0 && (
                <motion.div
                  key="ratio-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center gap-10 py-6 sm:flex-row"
                >
                  <ResponsiveContainer width={190} height={190}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={<GlassTooltip />}
                        formatter={(value: any, name: any, prop: any) => [`${value} students (${prop?.payload?.percentage ?? 0}%)`, name ?? "Students"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-3 min-w-[200px]">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Employment Ratio</h4>
                    {pieData.map((item, idx) => (
                      <div key={item.name} className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 text-xs font-bold text-slate-700">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx] }}></div>
                        <span>
                          {item.name}: <span className="font-black text-slate-900">{item.value}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">({item.percentage}%)</span>
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
