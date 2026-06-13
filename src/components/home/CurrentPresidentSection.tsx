"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Instagram, Linkedin, Twitter, Mail } from "lucide-react";
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
    <div className="mb-5 sm:mb-12 overflow-hidden bg-white sm:rounded-[1.9rem] sm:border sm:border-slate-200 sm:bg-gradient-to-br sm:from-slate-50 sm:via-white sm:to-indigo-50 sm:shadow-[0_20px_60px_rgba(79,70,229,0.08)]">
      <div className="flex flex-col sm:grid sm:grid-cols-[150px_1fr] lg:grid-cols-[238px_1fr]">
        <div className="flex flex-row sm:flex-col gap-4 sm:gap-0 p-4 sm:p-0 items-center sm:items-stretch border-b border-slate-100 sm:border-none">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full sm:h-auto sm:w-auto sm:rounded-none bg-indigo-100">
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
                
              </div>
            )}
            <div className="absolute inset-y-0 right-0 hidden w-8 bg-gradient-to-l from-white/18 to-transparent sm:block" />
          </div>

          <div className="sm:hidden flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate">
              {currentPresident?.name || fallbackName}
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-indigo-600 truncate">
              {currentPresident ? `${currentPresident.role} - ${currentPresident.iiit}` : fallbackRole}
            </p>
            {currentPresident && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {currentPresident.linkedin && (
                  <a href={currentPresident.linkedin} target="_blank" rel="noreferrer" className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 text-[#0077b5]" title="LinkedIn">
                    <Linkedin size={12} />
                  </a>
                )}
                {currentPresident.instagram && (
                  <a href={currentPresident.instagram} target="_blank" rel="noreferrer" className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 text-[#E1306C]" title="Instagram">
                    <Instagram size={12} />
                  </a>
                )}
                {currentPresident.twitter && (
                  <a href={currentPresident.twitter} target="_blank" rel="noreferrer" className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 text-[#1DA1F2]" title="Twitter">
                    <Twitter size={12} />
                  </a>
                )}
                {currentPresident.email && (
                  <a href={currentPresident.email.startsWith("mailto:") ? currentPresident.email : `mailto:${currentPresident.email}`} target="_blank" rel="noreferrer" className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 text-indigo-600" title="Email">
                    <Mail size={12} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-4 lg:p-5">
          <div className="flex flex-col gap-2.5 sm:gap-4">
            <div className="hidden sm:block">
              <h3 className="text-base font-bold text-slate-900 sm:text-2xl">
                {currentPresident?.name || fallbackName}
              </h3>
              <p className="mt-1 text-[11px] font-medium text-indigo-600 sm:text-sm">
                {currentPresident ? `${currentPresident.role} - ${currentPresident.iiit}` : fallbackRole}
              </p>
              {currentPresident && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentPresident.linkedin && (
                    <a href={currentPresident.linkedin} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 text-[#0077b5]" title="LinkedIn">
                      <Linkedin size={14} />
                    </a>
                  )}
                  {currentPresident.instagram && (
                    <a href={currentPresident.instagram} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 text-[#E1306C]" title="Instagram">
                      <Instagram size={14} />
                    </a>
                  )}
                  {currentPresident.twitter && (
                    <a href={currentPresident.twitter} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 text-[#1DA1F2]" title="Twitter">
                      <Twitter size={14} />
                    </a>
                  )}
                  {currentPresident.email && (
                    <a href={currentPresident.email.startsWith("mailto:") ? currentPresident.email : `mailto:${currentPresident.email}`} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:bg-slate-100 text-indigo-600" title="Email">
                      <Mail size={14} />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-2 sm:gap-3 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-xl sm:rounded-[1.2rem] border border-indigo-100 bg-indigo-50/60 p-3 sm:p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600 sm:text-xs sm:tracking-[0.16em]">
                  President’s Note
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
