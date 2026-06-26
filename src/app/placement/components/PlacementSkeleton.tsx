"use client";

export default function PlacementSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-28 rounded-2xl border border-slate-100 bg-slate-100/20 p-5" />
        ))}
      </div>
      <div className="h-80 rounded-3xl border border-slate-100 bg-slate-100/20" />
    </div>
  );
}
