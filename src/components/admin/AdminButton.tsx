import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  isLoading?: boolean;
}

export function AdminButton({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  isLoading,
  className = "",
  disabled,
  ...props
}: AdminButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-1.5 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95 disabled:pointer-events-none disabled:opacity-50";
  
  const sizeClasses = {
    sm: "h-8 px-3 text-[11px] rounded-lg",
    md: "h-10 px-4 text-xs rounded-xl",
    lg: "h-12 px-6 text-sm rounded-xl",
  }[size];

  const variantClasses = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm focus:ring-slate-900",
    secondary: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-500",
    danger: "bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 focus:ring-rose-500",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      ) : null}
      {children}
    </button>
  );
}
