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
    <div>
      <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900 mb-4 sm:mb-12 text-left">
        <br />
        Our Initiatives
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
        {projects.map((project, index) => {
          const IconComponent = project.icon;
          return (
            <Link
              key={index}
              href={project.route}
              className="
                bg-gradient-to-br from-white to-indigo-50
                rounded-xl sm:rounded-2xl
                p-4 sm:p-8
                shadow-lg border border-indigo-100
                hover:shadow-xl transition-all duration-300
                transform hover:-translate-y-2
                flex sm:block
                gap-4
              "
            >
              {/* ICON */}
              <div
                className="
                  text-indigo-600
                  flex-shrink-0
                  mt-1 sm:mt-0
                "
              >
                <span className="sm:hidden">
                  <IconComponent size={20} />
                </span>
                <span className="hidden sm:block">
                  <IconComponent size={28} />
                </span>
              </div>

              {/* TEXT */}
              <div className="mt-1 sm:mt-0">
                <h3 className="text-sm sm:text-xl font-semibold tracking-tight text-gray-900 mb-1 sm:mb-3">
                  {project.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
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
