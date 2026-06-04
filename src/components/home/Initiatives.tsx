"use client";

import React from "react";
import Link from "next/link";
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
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-[1.85rem] lg:leading-tight">
        Our Initiatives
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
