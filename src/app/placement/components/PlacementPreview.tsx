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
    <section className="ui-panel p-4 sm:p-5">
      <div className="mb-5 space-y-2 text-left">
        <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.2em] text-indigo-700">
          <Sparkles className="h-4 w-4" /> Quick Insights
        </span>
        <h2 className="text-xl font-black text-slate-950 sm:text-2xl">Featured IIIT placement dashboards</h2>
        <p className="max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
          Select a featured campus below to view branch summaries, charts, and placement statistics.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ui-card animate-pulse space-y-4 bg-slate-50 p-4">
              <div className="h-5 rounded bg-slate-200 w-2/3" />
              <div className="h-3 rounded bg-slate-100 w-1/3" />
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="h-12 rounded-xl bg-slate-200/50" />
                <div className="h-12 rounded-xl bg-slate-200/50" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c: any, index: number) => (
            <motion.div
              key={c.id}
              onClick={() => onSelectCollege(c.collegeName)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.04)" }}
              className="ui-card ui-card-hover group cursor-pointer p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-slate-900 leading-tight group-hover:text-indigo-600 transition">
                    {c.collegeName}
                  </h4>
                  <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Latest Report: {c.year}
                  </span>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-indigo-600 transition" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-left">
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
        <div className="ui-empty py-10 text-sm font-bold">
          Placement metrics are currently loading from records.
        </div>
      )}
    </section>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 transition hover:bg-slate-100/50">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-xs font-black text-slate-800">{value}</p>
    </div>
  );
}
