import React from "react";

interface FormItemProps {
  label: string;
  children: React.ReactNode;
}

export default function FormItem({ label, children }: FormItemProps) {
  return (
    <div className="space-y-2">
      <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}
