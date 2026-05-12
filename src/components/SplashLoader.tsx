"use client";
export default function SplashLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white">
      <div className="h-14 w-14 animate-spin rounded-full border-[5px] border-indigo-100 border-t-indigo-600" />
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-indigo-400">Loading…</p>
    </div>
  );
}
