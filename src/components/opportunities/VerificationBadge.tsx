"use client";

import { ShieldCheck, BadgeCheck } from "lucide-react";

type BadgeType = "recruiter" | "company" | "student" | "alumni";

const config: Record<BadgeType, { label: string; icon: typeof ShieldCheck; light: string; dark: string }> = {
  recruiter: {
    label: "Verified Recruiter",
    icon: ShieldCheck,
    light: "text-emerald-700 bg-emerald-50/80 border-emerald-200/60",
    dark: "text-emerald-400 bg-emerald-950/40 border-emerald-800/30",
  },
  company: {
    label: "Verified Company",
    icon: BadgeCheck,
    light: "text-blue-700 bg-blue-50/80 border-blue-200/60",
    dark: "text-blue-400 bg-blue-950/40 border-blue-800/30",
  },
  student: {
    label: "Verified Student",
    icon: ShieldCheck,
    light: "text-indigo-700 bg-indigo-50/80 border-indigo-200/60",
    dark: "text-indigo-400 bg-indigo-950/40 border-indigo-800/30",
  },
  alumni: {
    label: "Verified Alumni",
    icon: ShieldCheck,
    light: "text-violet-700 bg-violet-50/80 border-violet-200/60",
    dark: "text-violet-400 bg-violet-950/40 border-violet-800/30",
  },
};

interface VerificationBadgeProps {
  type: BadgeType;
  isDarkMode: boolean;
  className?: string;
}

export default function VerificationBadge({ type, isDarkMode, className = "" }: VerificationBadgeProps) {
  const c = config[type];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold leading-none ${
        isDarkMode ? c.dark : c.light
      } ${className}`}
    >
      <Icon size={11} className="shrink-0" />
      {c.label}
    </span>
  );
}
