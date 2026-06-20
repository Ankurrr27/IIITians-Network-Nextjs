import React from "react";

interface AdminTableProps {
  children: React.ReactNode;
}

export function AdminTable({ children }: AdminTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-slate-600">
          {children}
        </table>
      </div>
    </div>
  );
}

export function AdminTableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
      <tr>{children}</tr>
    </thead>
  );
}

export function AdminTh({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 sm:px-6 ${className}`}>{children}</th>;
}

export function AdminTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function AdminTableRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tr className={`transition hover:bg-slate-50/50 ${className}`}>{children}</tr>;
}

export function AdminTd({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 sm:px-6 ${className}`}>{children}</td>;
}

export function AdminBadge({ children, color = "slate" }: { children: React.ReactNode; color?: "indigo" | "emerald" | "rose" | "sky" | "amber" | "slate" }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-500/20",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-500/20",
    rose: "bg-rose-50 text-rose-700 ring-rose-500/20",
    sky: "bg-sky-50 text-sky-700 ring-sky-500/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-500/20",
    slate: "bg-slate-100 text-slate-700 ring-slate-500/20",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${colorMap[color]}`}>
      {children}
    </span>
  );
}
