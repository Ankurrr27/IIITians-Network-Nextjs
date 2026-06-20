"use client";

import React from "react";
import { useRouter } from "next/navigation";
import BigTeamCard from "./BigTeamCard";
import CurrentPresidentSection from "./CurrentPresidentSection";

export default function FounderSection() {
  const router = useRouter();

  return (
    <section className="bg-slate-50 sm:bg-white py-8 sm:py-20">
      <div className="mx-auto max-w-7xl px-0 sm:px-6">
        <div className="px-4 sm:px-0 mb-6 sm:mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            IIITians Network Team
          </h2>
        </div>

        <div className="sm:px-0">
          <CurrentPresidentSection />
        </div>

        <div className="px-4 sm:px-0 mb-5 sm:mb-8 sm:flex sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Founding Team
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
              Meet the people who started IIITians Network and laid the
              foundation for a unified, transparent, and student-first platform
              across IIIT campuses.
            </p>
          </div>

          <button
            onClick={() => router.push("/team")}
            className="mt-2 sm:mt-1 shrink-0 text-xs font-semibold text-indigo-500 hover:text-indigo-700 hover:underline transition cursor-pointer block"
          >
            View current team
          </button>
        </div>

        <div className="grid grid-cols-1 gap-px bg-slate-200 sm:bg-transparent sm:gap-5 lg:grid-cols-3 lg:gap-7">
          <BigTeamCard
            name="Anant Mehra"
            role="Former President and CFO"
            college="IIIT Kota"
            image="/Founders/Anant.png"
            desc="I have witnessed the IIITians Network grow from its inception (January 2020) when it was first initiated, into a platform that has created a significant impact on the IIIT community. At the time, I could not have anticipated the scale and influence it would achieve. What excites me most is seeing new batches join the IIITians Network core team and actively contribute value to this remarkable community. I look forward to the innovative initiatives that will be launched under the leadership of the new generation."
            links={{
              linkedin: "https://linkedin.com/in/anant-mehra-626952190",
              instagram:
                "https://www.instagram.com/_.infinity7._?igshid=y3ei9hsdwle7",
            }}
          />

          <BigTeamCard
            name="Shashwat Gupta"
            role="Former COO"
            college="IIIT Gwalior"
            image="/Founders/Shaswat.png"
            desc="IIITians Network began in the first year of college, driven by a long-standing desire to build something meaningful for the community. Taking on the role of COO, the focus was on growth and engagement, helping shape the journey from 0 to 1. Grateful to have met co-founders Anant and Prashant, and deeply thankful for their trust and support. Immensely proud of the juniors who are now carrying the vision forward and taking IIITians Network from 1 to 100. Excited for what lies ahead."
            links={{
              linkedin: "https://www.linkedin.com/in/shashwat-gupta-ab9675179/",
              instagram: "https://www.instagram.com/divisible_by_zero/",
            }}
          />

          <BigTeamCard
            name="Prashant Katiyar"
            role="Former CEO"
            college="IIIT Guwahati"
            image="/Founders/3rd.jpeg"
            desc="IIITians Network has been a key achievement in my career. Started with peers across IIITs, it aimed to unite students, learn new technologies, collaborate on freelancing, and support placements and startups. We organized hackathons, launched “Code Chronicles,” and built ventures like CometLabs. Now, I’m working to revive these initiatives with juniors."
            links={{
              linkedin: "https://www.linkedin.com/in/prashant-milan-katiyar/",
              instagram: "https://www.instagram.com/k.prashant__/?hl=en",
            }}
          />
        </div>
      </div>
    </section>
  );
}
