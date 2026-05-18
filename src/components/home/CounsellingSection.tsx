"use client";

import React, { useState } from "react";

const counsellingPoints = [
  {
    title: "Rank-Based Guidance",
    content:
      "Suggestions aligned with your JEE rank, category, and preferences to help you shortlist realistic institute and branch options.",
  },
  {
    title: "IIIT & Branch Comparison",
    content:
      "Clear comparison of IIITs and branches based on academics, placements, campus life, and long-term opportunities.",
  },
  {
    title: "Student-Led Insights",
    content:
      "First-hand guidance from current IIIT students who have already gone through JoSAA and CSAB counselling.",
  },
];

export default function CounsellingSection() {
  const [active, setActive] = useState<number | null>(null);
  const [showMore, setShowMore] = useState(false);

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 sm:mb-16 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
            Counselling Support
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            JEE Counselling Guidance
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Practical, experience-backed support for JoSAA and CSAB counselling,
            designed to help aspirants make confident and informed choices.
          </p>
        </div>

        <div className="grid items-start gap-8 sm:gap-10 md:grid-cols-2 text-left">
          <div className="space-y-4 text-sm leading-7 text-slate-700 sm:text-base">
            <p>
              IIITians Network simplifies the JEE counselling process by
              providing aspirants with clear, unbiased guidance based on real
              student experiences across IIITs.
            </p>

            <div className={`${showMore ? "block" : "hidden"} space-y-4 sm:block`}>
              <p>
                We focus on reducing confusion during JoSAA and CSAB rounds by
                explaining institute realities, branch expectations, cutoff
                trends, and placement stats without exaggeration or false
                promises.
              </p>

              <ul className="list-disc space-y-2 pl-5">
                <li>Institute-wise and branch-wise counselling clarity</li>
                <li>Previous year cutoff trends and interpretation</li>
                <li>Academic workload and placement expectations</li>
                <li>Common mistakes to avoid during choice filling</li>
              </ul>
            </div>

            <button
              onClick={() => setShowMore((prev) => !prev)}
              className="text-sm font-medium text-indigo-600 sm:hidden"
            >
              {showMore ? "Read less" : "Read more"}
            </button>

            <div className="hidden pt-4 sm:block">
              <p className="mb-3 text-sm font-medium text-slate-900">
                Official counselling portals
              </p>

              <div className="flex flex-wrap gap-3 text-sm">
                <a
                  href="https://josaa.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-indigo-200 px-4 py-2 font-medium text-indigo-600 transition hover:bg-indigo-50"
                >
                  JoSAA Official Website
                </a>

                <a
                  href="https://csab.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-indigo-200 px-4 py-2 font-medium text-indigo-600 transition hover:bg-indigo-50"
                >
                  CSAB Official Website
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-gradient-to-br from-indigo-50 to-blue-50 p-5 shadow-md sm:p-8">
            <h3 className="text-base font-semibold text-slate-900 sm:text-xl">
              How We Help
            </h3>

            <div className="mt-5 space-y-3">
              {counsellingPoints.map((item, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <button
                    onClick={() => setActive(active === index ? null : index)}
                    className="flex w-full items-center justify-between p-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:p-4"
                  >
                    <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                      {item.title}
                    </span>
                    <span className="text-lg text-indigo-600 font-bold">
                      {active === index ? "−" : "+"}
                    </span>
                  </button>

                  {active === index && (
                    <div className="px-3 pb-3 text-xs text-slate-600 sm:px-4 sm:pb-4 sm:text-sm">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:hidden">
          <a
            href="https://josaa.nic.in"
            target="_blank"
            rel="noreferrer"
            className="w-full rounded-xl border border-indigo-600 py-2.5 text-center text-sm font-medium text-indigo-600"
          >
            JoSAA Official Website
          </a>

          <a
            href="https://csab.nic.in"
            target="_blank"
            rel="noreferrer"
            className="w-full rounded-xl border border-indigo-600 py-2.5 text-center text-sm font-medium text-indigo-600"
          >
            CSAB Official Website
          </a>
        </div>
      </div>
    </section>
  );
}
