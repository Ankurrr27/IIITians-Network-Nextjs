import React, { useMemo } from "react";
import { Upload } from "lucide-react";

interface AssetPickerProps {
  title: string;
  helper: string;
  file: File | null;
  existingUrl?: string;
  fallback: string;
  onPick: (file: File) => void;
}

export function AssetPicker({
  title,
  helper,
  file,
  existingUrl,
  fallback,
  onPick,
}: AssetPickerProps) {
  const previewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : existingUrl || fallback;
  }, [file, existingUrl, fallback]);

  return (
    <div className="group overflow-hidden rounded-[1.8rem] border border-white bg-white/60 p-5 shadow-[0_12px_30px_-15px_rgba(79,70,229,0.12)] backdrop-blur-md transition-all hover:bg-white/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200 transition-transform group-hover:scale-[1.05]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className="text-[15px] font-bold text-slate-900">{title}</div>
            <div className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">{helper}</div>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[linear-gradient(135deg,_#6366f1,_#4f46e5)] px-5 py-2.5 text-xs font-bold text-white shadow-[0_10px_20px_-8px_rgba(79,70,229,0.5)] transition-all hover:scale-105 active:scale-95">
            <Upload className="h-4 w-4" />
            {file ? "Change Asset" : "Choose Photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0];
                if (selected) onPick(selected);
                event.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

interface AssetInlinePickerProps {
  title: string;
  file: File | null;
  onPick: (file: File) => void;
}

export function AssetInlinePicker({ title, file, onPick }: AssetInlinePickerProps) {
  return (
    <label className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white bg-white/60 px-5 py-4 text-sm text-slate-800 shadow-sm backdrop-blur-md transition-all hover:bg-white/90 hover:shadow-md">
      <span className="font-bold tracking-tight">{file ? `${title} Loaded` : title}</span>
      <span className="flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,_#6366f1,_#4f46e5)] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg transition-transform group-hover:scale-105">
        <Upload className="h-3.5 w-3.5" />
        Upload
      </span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (selected) onPick(selected);
          event.target.value = "";
        }}
      />
    </label>
  );
}

interface MultiAssetInlinePickerProps {
  title: string;
  files: File[];
  onPick: (files: File[]) => void;
}

export function MultiAssetInlinePicker({ title, files = [], onPick }: MultiAssetInlinePickerProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200/80 transition hover:bg-white hover:ring-indigo-200">
      <span className="font-semibold text-xs">
        {files.length ? `${files.length} ${title.toLowerCase()} ready` : title}
      </span>
      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white flex items-center">
        <Upload className="mr-1 h-3.5 w-3.5" />
        Add
      </span>
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const selected = Array.from(event.target.files || []);
          if (selected.length) onPick(selected);
          event.target.value = "";
        }}
      />
    </label>
  );
}

interface MultiAssetPickerProps {
  title: string;
  helper: string;
  files: File[];
  existingUrls: string[];
  onPick: (files: File[]) => void;
}

export function MultiAssetPicker({
  title,
  helper,
  files = [],
  existingUrls = [],
  onPick,
}: MultiAssetPickerProps) {
  const previewUrls = useMemo(() => {
    return [
      ...existingUrls,
      ...files.map((file) => URL.createObjectURL(file)),
    ];
  }, [existingUrls, files]);

  const COLLEGE_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8'>No Image</text></svg>";

  return (
    <div className="group rounded-[1.8rem] border border-white bg-white/60 p-5 shadow-[0_12px_30px_-15px_rgba(79,70,229,0.12)] backdrop-blur-md transition-all hover:bg-white/80">
      <div className="space-y-4">
        <div>
          <div className="text-[15px] font-bold text-slate-900">{title}</div>
          <div className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500">{helper}</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(previewUrls.length ? previewUrls.slice(0, 6) : [COLLEGE_PLACEHOLDER]).map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-transform hover:scale-[1.05] hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${title} ${index + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[linear-gradient(135deg,_#6366f1,_#4f46e5)] px-6 py-3 text-xs font-bold text-white shadow-[0_10px_25px_-8px_rgba(79,70,229,0.5)] transition-all hover:scale-105 active:scale-95">
          <Upload className="h-4 w-4" />
          Add More Experience Photos
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              const selected = Array.from(event.target.files || []);
              if (selected.length) onPick(selected);
              event.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}
