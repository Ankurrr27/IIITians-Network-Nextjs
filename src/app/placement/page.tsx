"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/apiClient";
import type { ICollege, IPlacement } from "@/types";
import { TrendingUp, ChevronDown } from "lucide-react";

export default function PlacementPage() {
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [placements, setPlacements] = useState<IPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | "">("");

  useEffect(() => {
    Promise.all([api.get("/colleges"), api.get("/placements")])
      .then(([colRes, plRes]) => {
        setColleges([...colRes.data].sort((a: ICollege, b: ICollege) => a.name.localeCompare(b.name)));
        setPlacements(plRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const currentPlacement = useMemo(
    () => placements.find((p) => {
      const college = typeof p.college === "string" ? p.college : (p.college as ICollege)._id;
      return college === selectedCollege;
    }),
    [placements, selectedCollege]
  );

  const availableYears = useMemo(
    () => [...(currentPlacement?.yearlyPlacements || [])].map((y) => y.year).sort((a, b) => b - a),
    [currentPlacement]
  );

  const yearData = useMemo(
    () => currentPlacement?.yearlyPlacements?.find((y) => y.year === selectedYear),
    [currentPlacement, selectedYear]
  );

  // Reset year when college changes
  useEffect(() => { setSelectedYear(availableYears[0] ?? ""); }, [availableYears]);

  const collegeName = colleges.find((c) => c._id === selectedCollege)?.name;

  return (
    <main className="relative min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] pb-20 pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-500">Placement Data</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            IIIT <span className="text-indigo-600">Placements</span>
          </h1>
          <p className="mt-3 text-slate-500">Branch-wise placement stats across IIITs — updated by the network team.</p>
        </header>

        {/* Selectors */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Select College</label>
            <div className="relative">
              <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-9 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">Choose an IIIT…</option>
                {colleges.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          {availableYears.length > 0 && (
            <div className="sm:w-36">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Year</label>
              <div className="relative">
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-9 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-300">
                  {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>
        ) : !selectedCollege ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-400 shadow-sm">
            Select a college above to view placement data.
          </div>
        ) : !currentPlacement ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center shadow-sm">
            <p className="text-slate-500">No placement data for <strong>{collegeName}</strong> yet.</p>
          </div>
        ) : !yearData ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-400 shadow-sm">
            No data for year {selectedYear}.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">{collegeName} — Placements {selectedYear}</h2>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Branches", value: yearData.placements.length },
                { label: "Highest (LPA)", value: Math.max(...yearData.placements.map((p) => p.highestPackage)) },
                { label: "Average (LPA)", value: (yearData.placements.reduce((s, p) => s + p.averagePackage, 0) / yearData.placements.length).toFixed(1) },
                { label: "Students Placed", value: yearData.placements.reduce((s, p) => s + p.studentsPlaced, 0) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-xl font-extrabold text-indigo-600">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    {["Branch", "Highest (LPA)", "Average (LPA)", "Lowest (LPA)", "Placed %", "Placed", "Total"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {yearData.placements.map((row) => (
                    <tr key={row.branch} className="hover:bg-indigo-50/30 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.branch}</td>
                      <td className="px-4 py-3 text-emerald-600 font-bold">{row.highestPackage}</td>
                      <td className="px-4 py-3 text-indigo-600 font-semibold">{row.averagePackage}</td>
                      <td className="px-4 py-3 text-slate-500">{row.lowestPackage}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(row.placementPercentage, 100)}%` }} />
                          </div>
                          <span className="text-slate-600">{row.placementPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.studentsPlaced}</td>
                      <td className="px-4 py-3 text-slate-400">{row.totalStudents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
