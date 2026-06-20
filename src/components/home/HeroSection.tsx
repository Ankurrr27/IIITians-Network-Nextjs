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
        relative flex min-h-[88dvh] items-center justify-center overflow-hidden
        bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)]
        pt-20 sm:min-h-screen sm:pt-36
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
          relative z-10 grid w-full max-w-7xl grid-cols-1 items-center  sm:gap-5
          px-4 sm:gap-8 sm:px-6 md:grid-cols-2 md:gap-20
        "
      >
        {/* Blob — above text on mobile, left on desktop */}
        <div className="flex justify-center md:justify-start md:-ml-15">
          <div className="animate-float scale-90 sm:scale-110 md:scale-100">
            <BlobWithLogo />
          </div>
        </div>

        {/* Text — below blob on mobile, right on desktop */}
        <div className="text-left">
          <h1
            className="
              mt-4 text-[2rem] font-semibold leading-tight tracking-tight text-slate-900
              sm:text-4xl md:text-5xl lg:text-6xl
            "
          >
            <span className="text-slate-900 block">Empowering</span>
            <span className="block mt-2">
              <span className="text-indigo-600 font-bold">
                Connections Across IIITs
              </span>
            </span>
          </h1>

          <p
            className="
              mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base
            "
          >
            IIITians Network is an autonomous student-led community connecting all
            IIITs across India. We aim to exchange information, boost outreach, and
            connect students with alumni while promoting the brand <span className="font-semibold">&quot;IIITians&quot;</span>.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-5">
            <button
              onClick={() => router.push("/events")}
              className="
                rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20
                transition hover:bg-indigo-700 active:scale-95 sm:px-8 sm:text-base
              "
            >
              Explore
            </button>

            <button
              onClick={() => router.push("/colleges")}
              className="
                rounded-xl border border-indigo-600 bg-white px-6 py-3 text-sm font-semibold text-indigo-600
                transition hover:bg-indigo-50 active:scale-95 sm:px-8 sm:text-base
              "
            >
              Colleges
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
