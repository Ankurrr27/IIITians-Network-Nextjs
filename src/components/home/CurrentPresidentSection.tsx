"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/apiClient";
import type { ITeamMember } from "@/types";

function getPresidentPriority(role = "") {
  const normalizedRole = role.toLowerCase().trim().replace(/\s+/g, " ");

  if (/\bpresident\b/.test(normalizedRole) && !/\bvice president\b/.test(normalizedRole)) {
    return 0;
  }

  if (/\bvice president\b/.test(normalizedRole)) {
    return 1;
  }

  return 99;
}

function compareTenureYears(a = "", b = "") {
  return String(b).localeCompare(String(a), undefined, { numeric: true });
}

export default function CurrentPresidentSection() {
  const [members, setMembers] = useState<ITeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api
      .get("/team")
      .then((response) => {
        if (!mounted) return;
        setMembers(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setMembers([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const currentPresident = useMemo(() => {
    const executives = members.filter((member) => member.roleType === "EXEC");

    const latestYear =
      executives
        .map((member) => member.year)
        .filter(Boolean)
        .sort(compareTenureYears)[0] || null;

    const latestExecutives = latestYear
      ? executives.filter((member) => member.year === latestYear)
      : executives;

    const sortedExecutives = latestExecutives
      .sort((a, b) => {
        const priorityA = getPresidentPriority(a.role);
        const priorityB = getPresidentPriority(b.role);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : Number.MAX_SAFE_INTEGER;
        const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : Number.MAX_SAFE_INTEGER;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        return (a.name || "").localeCompare(b.name || "");
      });

    return (
      sortedExecutives.find((member) => getPresidentPriority(member.role) === 0) ||
      sortedExecutives.find((member) => getPresidentPriority(member.role) === 1) ||
      sortedExecutives[0] ||
      null
    );
  }, [members]);

  const fallbackName = "Current President";
  const fallbackRole = "IIITians Network";
  const about = currentPresident
    ? (
    currentPresident.aboutText ||
      `${currentPresident.name} is leading the current IIITians Network team with a focus on student coordination, continuity, and building a stronger network across campuses.`
    )
    : "The IIITians Network leadership team is focused on continuity, student coordination, and building a stronger network across IIIT campuses.";
  const message = currentPresident
    ? (
    currentPresident.messageText ||
      `${currentPresident.name} and the current team are working to make IIITians Network more useful, accessible, and active for the wider IIIT community.`
    )
    : "We are building IIITians Network as a student-first platform where every IIITian can discover opportunities, communities, guidance, and people who make the network stronger.";
  const hasPhoto = Boolean(currentPresident?.photo?.url);

  return (
    <div className="mb-5 overflow-hidden rounded-[1.35rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50 shadow-[0_20px_60px_rgba(79,70,229,0.08)] sm:mb-12 sm:rounded-[1.9rem]">
      <div className="grid grid-cols-1 gap-0 sm:grid-cols-[150px_1fr] lg:grid-cols-[238px_1fr]">
        {/* Photo — compact horizontal strip on mobile, sidebar on desktop */}
        <div className="relative h-56 overflow-hidden bg-indigo-100 sm:h-auto sm:mx-0 sm:mt-0 sm:rounded-none">
          {loading ? (
            <div className="h-full w-full animate-pulse bg-indigo-100" />
          ) : hasPhoto ? (
            <img
              src={currentPresident?.photo?.url}
              alt={currentPresident?.name || fallbackName}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-sky-100 p-6 text-center text-lg font-black text-indigo-700">
              Notes from President
            </div>
          )}
          <div className="absolute inset-y-0 right-0 hidden w-8 bg-gradient-to-l from-white/18 to-transparent sm:block" />
        </div>

        <div className="p-3 sm:p-4 lg:p-5">
          <div className="flex flex-col gap-2.5 sm:gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white sm:px-3 sm:text-xs sm:tracking-[0.18em]">
                Notes from President
              </div>
              {currentPresident?.year && (
                <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.16em]">
                  {currentPresident.year}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 sm:text-2xl">
                {currentPresident?.name || fallbackName}
              </h3>
              <p className="mt-1 text-[11px] font-medium text-indigo-600 sm:text-sm">
                {currentPresident ? `${currentPresident.role} - ${currentPresident.iiit}` : fallbackRole}
              </p>
            </div>

            {/* On mobile: flat text. On desktop: bordered cards side-by-side */}
            <div className="grid gap-2 sm:gap-3 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="sm:rounded-[1.2rem] sm:border sm:border-slate-200 sm:bg-white sm:p-4 sm:shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.16em]">
                  About
                </p>
                <p className="mt-1.5 text-[12px] leading-5 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">
                  {about}
                </p>
              </div>

              <div className="sm:rounded-[1.2rem] sm:border sm:border-indigo-100 sm:bg-indigo-50/60 sm:p-4 sm:shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600 sm:text-xs sm:tracking-[0.16em]">
                  President’s Note
                </p>
                <p className="mt-1.5 text-[12px] leading-5 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">
                  "{message}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
