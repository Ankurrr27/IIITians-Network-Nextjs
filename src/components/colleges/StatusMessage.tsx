import React from "react";

interface StatusMessageProps {
  tone?: "success" | "error" | "neutral";
  children: React.ReactNode;
}

export default function StatusMessage({ tone = "neutral", children }: StatusMessageProps) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-700",
    neutral: "border-stone-200 bg-stone-50 text-stone-700",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${styles[tone]}`}>
      {children}
    </div>
  );
}
