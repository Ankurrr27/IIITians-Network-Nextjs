"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/apiClient";
import { formatLpa, summarizePlacementCollection } from "@/lib/placementInsights";
import { Sparkles, ArrowUpRight } from "lucide-react";

interface PlacementPreviewProps {
  onSelectCollege: (name: string) => void;
}

export default function PlacementPreview({ onSelectCollege }: PlacementPreviewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/placements").then((res) => {
      setItems(summarizePlacementCollection(res.data || []).slice(0, 6));
    }).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  return (
    <section className="ui-panel p-5 sm:p-6">
      {/* Header */}
      <div className="mb-5 space-y-1">
        <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
          <Sparkles className="h-3.5 w-3.5" /> Quick Insights
        </span>
        <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
          Featured IIIT placement dashboards
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
          Select a featured campus to view branch summaries, charts, and placement statistics.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="h-4 w-2/3 rounded bg-slate-200" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="h-10 rounded-lg bg-slate-200/60" />
                <div className="h-10 rounded-lg bg-slate-200/60" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c: any, index: number) => (
            <motion.div
              key={c.id}
              onClick={() => onSelectCollege(c.collegeName)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className="group cursor-pointer rounded-xl border border-slate-150 bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all duration-200 hover:border-indigo-200 hover:shadow-md hover:ring-indigo-100"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-extrabold leading-tight text-slate-900 group-hover:text-indigo-700 transition-colors">
                    {c.collegeName}
                  </p>
                  <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Latest Report: {c.year}
                  </span>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {c.highestPackage > 0 && (
                  <PreviewStat label="Highest Offer" value={formatLpa(c.highestPackage)} />
                )}
                {c.placementRate > 0 && (
                  <PreviewStat label="Placed Rate" value={`${c.placementRate.toFixed(1)}%`} accent />
                )}
                {c.medianPackage > 0 && (
                  <PreviewStat label="Median Pkg" value={formatLpa(c.medianPackage)} />
                )}
                {c.highestPlacementPercentage > 0 && (
                  <PreviewStat label="Top Branch %" value={`${c.highestPlacementPercentage.toFixed(0)}%`} accent />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="ui-empty py-10 text-sm font-semibold">
          Placement metrics are currently loading from records.
        </div>
      )}
    </section>
  );
}

function PreviewStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${accent ? "bg-indigo-50 ring-1 ring-indigo-100" : "bg-slate-50 ring-1 ring-slate-100"}`}>
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-0.5 text-[13px] font-black ${accent ? "text-indigo-700" : "text-slate-800"}`}>{value}</p>
    </div>
  );
}
