"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/apiClient";
import { formatLpa, summarizePlacementCollection } from "@/lib/placementInsights";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { iiitCampuses } from "@/data/iiitCampuses";

interface PlacementPreviewProps {
  onSelectCollege: (name: string) => void;
}

export default function PlacementPreview({ onSelectCollege }: PlacementPreviewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/placements").then((res) => {
      setItems(summarizePlacementCollection(res.data || []).slice(0, 9));
    }).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const getLogo = (collegeName: string) => {
    if (!collegeName) return "";
    const cleanName = collegeName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const campus = iiitCampuses.find((c) => {
      const cleanCamp = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cleanCamp.includes(cleanName) || cleanName.includes(cleanCamp);
    });
    return campus?.logo || "";
  };

  return (
    <section className="py-4 px-2">
      {/* Header */}
      <div className="mb-5 space-y-1">
        
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Featured IIIT placement dashboards
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
          Select a featured campus to view branch summaries, charts, and placement statistics.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-3 rounded-xl border border-slate-200 p-5">
              <div className="h-4 w-2/3 rounded bg-slate-100" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="h-8 rounded bg-slate-100" />
                <div className="h-8 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c: any, index: number) => {
            const logoUrl = getLogo(c.collegeName);
            return (
              <motion.div
                key={c.id}
                onClick={() => onSelectCollege(c.collegeName)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer rounded-xl border border-gray-300 bg-white p-5 transition-all duration-150 hover:bg-slate-50 hover:border-indigo-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold leading-tight text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {c.collegeName}
                    </p>
                    <span className="mt-0.5 inline-block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Latest Report: {c.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {logoUrl && (
                      <img 
                        src={logoUrl} 
                        alt={`${c.collegeName} logo`} 
                        className="h-7 w-7 rounded-full object-contain border border-slate-100 bg-white p-0.5 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
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
            );
          })}
        </div>
      ) : (
        <div className="ui-empty py-10 text-sm font-semibold">
          Placement data not available.
        </div>
      )}
    </section>
  );
}

function PreviewStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[9px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-0.5 text-[13px] font-semibold ${accent ? "text-indigo-600" : "text-slate-700"}`}>{value}</p>
    </div>
  );
}
