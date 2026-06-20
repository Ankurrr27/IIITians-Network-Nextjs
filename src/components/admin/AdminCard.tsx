import React from "react";

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  noBorder?: boolean;
}

export function AdminCard({ children, className = "", padding = "md", noBorder = false }: AdminCardProps) {
  const paddingClass = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-5",
    lg: "p-6 sm:p-8",
  }[padding];

  return (
    <div
      className={`rounded-xl bg-white shadow-sm ${!noBorder ? "border border-slate-200" : ""} ${paddingClass} ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminCardHeader({ title, description, action }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-3 mb-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {description && <p className="mt-0.5 text-xs font-medium text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
