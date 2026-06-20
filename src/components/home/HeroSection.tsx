"use client";

import React from "react";
import { useRouter } from "next/navigation";
import BlobWithLogo from "./BlobWithLogo";
import TopWaves from "./TopWaves";
import TopWavesMobile from "./TopWavesMobile";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section
      className="
        relative flex min-h-screen items-center justify-center overflow-hidden
        bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)]
        pt-24 sm:pt-36
      "
    >
      {/* Radial Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />

      <div className="block md:hidden">
        <TopWavesMobile />
      </div>

      <div className="hidden md:block">
        <TopWaves />
      </div>

      <div
        className="
          relative z-10 grid w-full max-w-7xl grid-cols-1 items-center gap-8
          px-4 sm:px-6 md:grid-cols-2 md:gap-20
        "
      >
        <div className="flex justify-center md:justify-start md:-ml-15">
          <div className="animate-float scale-90 sm:scale-100">
            <BlobWithLogo />
          </div>
        </div>

        <div className="text-left">
          <h1
            className="
              mt-4 text-4xl font-extrabold leading-tight tracking-tight text-slate-900
              sm:text-5xl md:text-6xl
            "
          >
            One Network.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
              All IIITs.
            </span>
          </h1>

          <p
            className="
              mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base font-medium
            "
          >
            Connecting students, alumni, startups, events, opportunities, and communities across India's IIIT ecosystem.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-5">
            <button
              onClick={() => router.push("/colleges")}
              className="
                rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20
                transition hover:bg-indigo-700 active:scale-95 sm:px-8 sm:text-base
              "
            >
              Explore IIITs
            </button>

            <button
              onClick={() => router.push("/discuss")}
              className="
                rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm
                transition hover:bg-slate-50 hover:border-slate-300 active:scale-95 sm:px-8 sm:text-base
              "
            >
              Join Community
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
