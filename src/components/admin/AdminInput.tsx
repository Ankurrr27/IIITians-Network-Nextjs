import React from "react";

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 ${
            error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10" : ""
          } ${className}`}
          {...props}
        />
        {error && <span className="text-[11px] font-semibold text-rose-600">{error}</span>}
      </div>
    );
  }
);
AdminInput.displayName = "AdminInput";

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const AdminTextarea = React.forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 custom-scrollbar ${
            error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10" : ""
          } ${className}`}
          {...props}
        />
        {error && <span className="text-[11px] font-semibold text-rose-600">{error}</span>}
      </div>
    );
  }
);
AdminTextarea.displayName = "AdminTextarea";

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, error, options, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 ${
            error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10" : ""
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-[11px] font-semibold text-rose-600">{error}</span>}
      </div>
    );
  }
);
AdminSelect.displayName = "AdminSelect";
