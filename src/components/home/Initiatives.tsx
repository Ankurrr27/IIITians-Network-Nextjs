"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Newspaper, Trophy, Database, Award } from "lucide-react";

const projects = [
  {
    title: "Centralized Placement Data",
    description:
      "Transparent and structured placement statistics across all IIITs to help students make informed career decisions.",
    icon: Database,
    route: "/placement",
  },
  {
    title: "News & Events Across IIITs",
    description:
      "A unified feed of technical, cultural, and academic events happening across all IIIT campuses.",
    icon: Newspaper,
    route: "/events",
  },
  {
    title: "Competitions & Hackathons",
    description:
      "Discover, participate, and collaborate in hackathons and competitions conducted nationwide.",
    icon: Trophy,
    route: "/events",
  },
  {
    title: "Network Legacy",
    description:
      "Showcasing the journeys, contributions, and evolving network story of IIITians across batches and roles.",
    icon: Award,
    route: "/legacy",
  },
];

export default function Initiatives() {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  // Auto-cycle effect on mobile
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % projects.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        Our Initiatives
      </h2>

      {/* Mobile view: 1 active stretched, 3 collapsed icons */}
      <div className="flex gap-2 w-full items-stretch sm:hidden min-h-[175px]">
        {projects.map((project, index) => {
          const isActive = activeIndex === index;
          const IconComponent = project.icon;
          return (
            <div
              key={index}
              onClick={() => {
                if (isActive) {
                  router.push(project.route);
                } else {
                  setActiveIndex(index);
                }
              }}
              className={`cursor-pointer transition-all duration-500 ease-in-out overflow-hidden rounded-2xl border flex ${
                isActive
                  ? "flex-[5] bg-white border-indigo-200 p-4 shadow-md shadow-indigo-100/50 ring-4 ring-indigo-50/50"
                  : "flex-1 bg-indigo-50/30 border-slate-100 items-center justify-center p-2 text-indigo-600/70 hover:bg-indigo-50"
              }`}
            >
              {isActive ? (
                <div className="flex flex-col h-full justify-between w-full">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <IconComponent size={16} />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {project.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500 leading-normal font-medium line-clamp-4">
                      {project.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 mt-2 block">
                    Learn more →
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <IconComponent size={20} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop view: original clean grid */}
      <div className="hidden sm:grid grid-cols-1 gap-5 sm:grid-cols-2">
        {projects.map((project, index) => {
          const IconComponent = project.icon;
          return (
            <Link
              key={index}
              href={project.route}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/50 hover:ring-4 hover:ring-indigo-50"
            >
              <div>
                {/* ICON */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  <IconComponent size={20} />
                </div>

                {/* TITLE */}
                <h3 className="mt-4 text-base font-bold text-slate-900 transition group-hover:text-indigo-600">
                  {project.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  {project.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
