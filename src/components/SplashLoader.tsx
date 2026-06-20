"use client";
export default function SplashLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950">
      <div className="relative h-16 w-56 animate-pulse px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/IIITians-Network-Logo-Light.png" alt="IIITians Network" className="h-full w-full object-contain" />
      </div>
    </div>
  );
}
