import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
        <p className="text-sm font-semibold text-slate-900">{data.year}</p>
        <p className="text-sm text-blue-600">Placement rate : {data.placementRate.toFixed(1)}%</p>
        <p className="text-sm text-teal-600">Weighted average package : {data.avgPackage.toFixed(2)} LPA</p>
      </div>
    );
  }
  return null;
};

export default function PlacementGrowthSection({ data, selectedCollegeName }) {
  const chartData = useMemo(() => {
    if (!data?.yearlyPlacements || data.yearlyPlacements.length === 0) return [];
    
    // Calculate yearly aggregates
    return data.yearlyPlacements
      .map((yearData) => {
        const placements = yearData.placements || [];
        
        // Calculate total students and placed students across all branches
        const totalStudents = placements.reduce((sum, p) => sum + (p.totalStudents || 0), 0);
        const studentsPlaced = placements.reduce((sum, p) => sum + (p.studentsPlaced || 0), 0);
        
        // Calculate weighted average package
        const totalPackageWeight = placements.reduce((sum, p) => {
          const students = p.studentsPlaced || 0;
          const avgPkg = p.averagePackage || 0;
          return sum + (students * avgPkg);
        }, 0);
        
        const weightedAvgPackage = studentsPlaced > 0 ? totalPackageWeight / studentsPlaced : 0;
        
        // Calculate overall placement rate
        const overallPlacementRate = totalStudents > 0 ? (studentsPlaced / totalStudents) * 100 : 0;
        
        return {
          year: yearData.year,
          placementRate: parseFloat(overallPlacementRate.toFixed(1)),
          avgPackage: parseFloat(weightedAvgPackage.toFixed(2)),
        };
      })
      .sort((a, b) => a.year - b.year);
  }, [data]);

  if (chartData.length === 0) return null;

  const minYear = Math.min(...chartData.map(d => d.year));
  const maxYear = Math.max(...chartData.map(d => d.year));

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[1.75rem] sm:p-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
          Placement Growth
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-900">
          {selectedCollegeName} growth over the years
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Track how placement rate and weighted average package have moved across the available placement years.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 60, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={true} />
          <XAxis 
            dataKey="year" 
            stroke="#94a3b8"
            style={{ fontSize: "12px" }}
            type="number"
            domain={[minYear - 0.5, maxYear + 0.5]}
          />
          <YAxis 
            yAxisId="left"
            stroke="#3b82f6"
            style={{ fontSize: "12px" }}
            label={{ value: "Placement Rate (%)", angle: -90, position: "insideLeft", offset: 10 }}
            domain={[0, 100]}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#0d9488"
            style={{ fontSize: "12px" }}
            label={{ value: "Package (LPA)", angle: 90, position: "insideRight", offset: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="placementRate" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: "#3b82f6", r: 6 }}
            activeDot={{ r: 8 }}
            isAnimationActive={true}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="avgPackage" 
            stroke="#0d9488" 
            strokeWidth={3}
            dot={{ fill: "#0d9488", r: 6 }}
            activeDot={{ r: 8 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
