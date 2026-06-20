"use client";

import { summarizePlacementYear, formatLpa } from "@/lib/placementInsights";

interface CampusComparisonDashboardProps {
  primaryName: string;
  primaryData: any;
  primaryYear: number | null;
  compareName: string;
  compareData: any;
}

export default function CampusComparisonDashboard({
  primaryName,
  primaryData,
  primaryYear,
  compareName,
  compareData
}: CampusComparisonDashboardProps) {
  
  // Extract latest years
  const primaryYearData = primaryYear 
    ? primaryData?.yearlyPlacements?.find((y: any) => y.year === primaryYear)
    : [...(primaryData?.yearlyPlacements || [])].sort((a: any, b: any) => b.year - a.year)[0];
    
  const compareYearData = [...(compareData?.yearlyPlacements || [])].sort((a: any, b: any) => b.year - a.year)[0];

  const primarySummary = primaryYearData ? summarizePlacementYear(primaryYearData) : null;
  const compareSummary = compareYearData ? summarizePlacementYear(compareYearData) : null;

  if (!primarySummary || !compareSummary) {
    return (
      <div className="rounded-2xl bg-slate-100 p-6 text-center text-sm font-bold text-slate-500">
        Incomplete data sets to compare. Make sure both campuses have valid metrics.
      </div>
    );
  }

  // Differentials
  const diffAvg = primarySummary.averagePackage - compareSummary.averagePackage;
  const diffMax = primarySummary.highestPackage - compareSummary.highestPackage;
  const diffRate = primarySummary.placementRate - compareSummary.placementRate;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Average Package Comparison */}
      <ComparisonMetricCard
        label="Average Package"
        primaryVal={primarySummary.averagePackage}
        compareVal={compareSummary.averagePackage}
        diff={diffAvg}
        primaryLabel={primaryName}
        compareLabel={compareName}
        isLpa={true}
      />

      {/* Highest Package Comparison */}
      <ComparisonMetricCard
        label="Highest Package"
        primaryVal={primarySummary.highestPackage}
        compareVal={compareSummary.highestPackage}
        diff={diffMax}
        primaryLabel={primaryName}
        compareLabel={compareName}
        isLpa={true}
      />

      {/* Placement Rate Comparison */}
      <ComparisonMetricCard
        label="Placement Rate"
        primaryVal={primarySummary.placementRate}
        compareVal={compareSummary.placementRate}
        diff={diffRate}
        primaryLabel={primaryName}
        compareLabel={compareName}
        isLpa={false}
      />
    </div>
  );
}

interface ComparisonMetricCardProps {
  label: string;
  primaryVal: number;
  compareVal: number;
  diff: number;
  primaryLabel: string;
  compareLabel: string;
  isLpa: boolean;
}

function ComparisonMetricCard({
  label,
  primaryVal,
  compareVal,
  diff,
  primaryLabel,
  compareLabel,
  isLpa
}: ComparisonMetricCardProps) {
  const format = (v: number) => isLpa ? `${v.toFixed(1)} LPA` : `${v.toFixed(0)}%`;
  const isPos = diff >= 0;

  // Max value for comparative bar scaling
  const maxBar = Math.max(primaryVal, compareVal, 1);
  const primaryPct = (primaryVal / maxBar) * 100;
  const comparePct = (compareVal / maxBar) * 100;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-black text-slate-900">{format(primaryVal)}</span>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
            isPos ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}>
            {isPos ? "+" : ""}{isLpa ? `${diff.toFixed(1)} LPA` : `${diff.toFixed(0)}%`}
          </span>
        </div>
      </div>

      {/* Comparative Bars */}
      <div className="space-y-2.5 pt-1.5 border-t border-slate-100">
        <div>
          <div className="flex justify-between text-[10px] font-bold mb-1">
            <span className="truncate text-slate-500 max-w-[120px]">{primaryLabel}</span>
            <span className="text-slate-800 font-extrabold">{format(primaryVal)}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${primaryPct}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-bold mb-1">
            <span className="truncate text-slate-500 max-w-[120px]">{compareLabel}</span>
            <span className="text-slate-800 font-extrabold">{format(compareVal)}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-slate-300" style={{ width: `${comparePct}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
