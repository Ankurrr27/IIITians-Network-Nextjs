"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

export default function PlacementBarSection({ yearData }) {
  const chartData = useMemo(() => {
    if (!yearData?.placements || yearData.placements.length === 0) return [];
    
    return yearData.placements
      .map((p) => ({
        branch: p.branch || "Unknown",
        placementPercentage: parseFloat(p.placementPercentage?.toFixed(1) || 0),
        avgPackage: parseFloat(p.averagePackage?.toFixed(2) || 0),
        highestPackage: parseFloat(p.highestPackage?.toFixed(2) || 0),
        lowestPackage: parseFloat(p.lowestPackage?.toFixed(2) || 0),
        studentsPlaced: p.studentsPlaced || 0,
        totalStudents: p.totalStudents || 0,
      }))
      .sort((a, b) => b.placementPercentage - a.placementPercentage);
  }, [yearData]);

  // Calculate placement distribution (placed vs unplaced)
  const placementDistribution = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const totalPlaced = chartData.reduce((sum, b) => sum + b.studentsPlaced, 0);
    const totalUnplaced = chartData.reduce((sum, b) => sum + (b.totalStudents - b.studentsPlaced), 0);
    
    return [
      { name: "Placed", value: totalPlaced, percentage: ((totalPlaced / (totalPlaced + totalUnplaced)) * 100).toFixed(1) },
      { name: "Unplaced", value: totalUnplaced, percentage: ((totalUnplaced / (totalPlaced + totalUnplaced)) * 100).toFixed(1) },
    ];
  }, [chartData]);

  const topBranch = chartData[0];

  if (chartData.length === 0 || !topBranch) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900">
          Branch-wise Placement Details
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Ranked by placement percentage
        </p>
      </div>

      {/* Table with Donut Chart */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Highest</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Average</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Placed %</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Placement Distribution</th>
              </tr>
            </thead>
            <tbody>
              {chartData.slice(0, 5).map((branch, idx) => (
                <tr key={branch.branch} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-4 text-sm font-bold text-slate-900">{idx + 1}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                    {branch.branch}
                    {idx === 0 && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">⭐ Top</span>}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-indigo-600">
                    {branch.highestPackage.toFixed(1)} LPA
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                    {branch.avgPackage.toFixed(2)} LPA
                  </td>
                  <td className="px-4 py-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
                      <span className="text-sm font-bold text-emerald-700">{branch.placementPercentage}%</span>
                      <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm text-slate-600">
                    {idx === 0 && (
                      <div className="flex items-center justify-end">
                        <ResponsiveContainer width={120} height={80}>
                          <PieChart>
                            <Pie
                              data={placementDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={20}
                              outerRadius={40}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {placementDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} students`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Placement Distribution Legend */}
      {chartData.length > 0 && (
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Placement Overview
          </div>
          <div className="flex items-center gap-6">
            {placementDistribution.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                <span className="text-xs font-medium text-slate-600">
                  {item.name}: <span className="font-bold text-slate-900">{item.percentage}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
