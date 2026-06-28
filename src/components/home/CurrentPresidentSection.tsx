"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Instagram, Linkedin, Twitter, Mail } from "lucide-react";
import api from "@/lib/apiClient";
import type { ITeamMember, IAlumni } from "@/types";

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

  const latestYear = useMemo(() => {
    const executives = members.filter((member) => member.roleType === "EXEC");
    return (
      executives
        .map((member) => member.year)
        .filter(Boolean)
        .sort(compareTenureYears)[0] || null
    );
  }, [members]);

  const currentPresident = useMemo(() => {
    if (!latestYear) return null;
    const latestExecutives = members.filter(
      (member) => member.roleType === "EXEC" && member.year === latestYear
    );

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
  }, [members, latestYear]);

  const [alumniData, setAlumniData] = useState<IAlumni | null>(null);
  const [loadingAlumni, setLoadingAlumni] = useState(false);

  useEffect(() => {
    if (!currentPresident?.name) {
      setAlumniData(null);
      return;
    }
    setLoadingAlumni(true);

    let mounted = true;
    api
      .get("/alumni", { params: { search: currentPresident.name } })
      .then((response) => {
        if (!mounted) return;
        const list = Array.isArray(response.data?.alumni)
          ? response.data.alumni
          : Array.isArray(response.data)
          ? response.data
          : [];
        const match = list.find(
          (item: any) =>
            item.name?.toLowerCase().trim() === currentPresident.name.toLowerCase().trim()
        );
        if (match) {
          setAlumniData(match);
        } else {
          setAlumniData(null);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setAlumniData(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingAlumni(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentPresident]);

  const journey = useMemo(() => {
    if (alumniData?.roleHistory && alumniData.roleHistory.length > 0) {
      return [...alumniData.roleHistory].sort((a, b) => b.year.localeCompare(a.year));
    }
    if (currentPresident) {
      return [
        {
          role: currentPresident.role,
          team: currentPresident.iiit || "IIITians Network",
          year: currentPresident.year || latestYear || "",
        },
      ];
    }
    return [];
  }, [alumniData, currentPresident, latestYear]);

  const vicePresidents = useMemo(() => {
    if (!latestYear) return [];
    return members.filter(
      (m) =>
        m.year === latestYear &&
        m.roleType === "EXEC" &&
        getPresidentPriority(m.role) === 1
    );
  }, [members, latestYear]);

  const leads = useMemo(() => {
    if (!latestYear) return [];
    return members.filter((m) => m.year === latestYear && m.roleType === "LEAD");
  }, [members, latestYear]);

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  }, [leads]);

  const fallbackName = "Current President";
  const fallbackRole = "IIITians Network";
  const message = currentPresident
    ? (
    currentPresident.messageText ||
      `${currentPresident.name} and the current team are working to make IIITians Network more useful, accessible, and active for the wider IIIT community.`
    )
    : "We are building IIITians Network as a student-first platform where every IIITian can discover opportunities, communities, guidance, and people who make the network stronger.";
  const hasPhoto = Boolean(currentPresident?.photo?.url);

  if (loading) {
    return (
      <div className="mb-5 sm:mb-12 h-64 animate-pulse rounded-[0.9rem] bg-slate-100" />
    );
  }

  return (
    <div className="mb-5 sm:mb-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.20fr_1fr] items-stretch">
      {/* 1. President Card (as it is) */}
      <div className="flex flex-col overflow-hidden bg-white sm:rounded-[0.9rem] sm:border sm:border-slate-200 sm:bg-gradient-to-br sm:from-slate-50 sm:via-white sm:to-indigo-50 sm:shadow-[0_20px_60px_rgba(79,70,229,0.08)]">
        <div className="flex flex-col sm:grid sm:grid-cols-[150px_1fr] lg:grid-cols-[210px_1fr] h-full">
          <div className="flex flex-row sm:flex-col gap-4 sm:gap-0 p-4 sm:p-0 items-center sm:items-stretch border-b border-slate-100 sm:border-none sm:h-full">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full sm:h-full sm:w-full sm:rounded-none bg-indigo-50">
              {hasPhoto ? (
                <img
                  src={currentPresident?.photo?.url}
                  alt={currentPresident?.name || fallbackName}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-sky-100 p-6 text-center text-lg font-black text-indigo-700">
                  {currentPresident?.name?.charAt(0) || "P"}
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

          <div className="p-4 sm:p-4 lg:p-5 flex flex-col justify-between h-full">
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

              <div className="mt-2.5">
                <p className="text-sm leading-relaxed text-slate-600 font-medium">
                  {message}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Link 
                href="/team" 
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-700 hover:underline transition cursor-pointer"
              >
                View current team &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Vice Presidents & Term Leads (Right Side) */}
      <div className="flex flex-col bg-transparent sm:bg-white sm:rounded-[0.9rem] sm:border sm:border-slate-200 sm:bg-gradient-to-br sm:from-slate-50 sm:via-white sm:to-indigo-50 sm:shadow-[0_20px_60px_rgba(79,70,229,0.08)] px-4 sm:px-5 py-0 sm:py-5">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 sm:border-slate-200/60 pb-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Leadership & Leads ({latestYear})
          </h4>
        </div>

        {/* Vice Presidents */}
        {vicePresidents.length > 0 && (
          <div className="mb-5">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Vice President
            </h5>
            <div className="flex flex-col gap-2">
              {vicePresidents.map((vp) => (
                <div key={vp._id || vp.name} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-indigo-100 bg-indigo-50">
                    {vp.photo?.url ? (
                      <img
                        src={vp.photo.url}
                        alt={vp.name}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-indigo-600 bg-indigo-50 text-xs">
                        {vp.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h6 className="text-sm font-bold text-slate-900 truncate">{vp.name}</h6>
                    <p className="text-xs text-indigo-600 font-semibold truncate mt-0.5">{vp.iiit}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {vp.linkedin && (
                      <a href={vp.linkedin} target="_blank" rel="noreferrer" className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-[#0077b5] hover:text-[#005582] transition hover:bg-slate-100 shadow-sm" title="LinkedIn">
                        <Linkedin size={11} />
                      </a>
                    )}
                    {vp.email && (
                      <a href={vp.email.startsWith("mailto:") ? vp.email : `mailto:${vp.email}`} className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-full border border-slate-100 bg-slate-50 text-indigo-600 hover:text-indigo-800 transition hover:bg-slate-100 shadow-sm" title="Email">
                        <Mail size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Term Leads */}
        {sortedLeads.length > 0 ? (
          <div className="flex-1 flex flex-col min-h-0">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Term Leads
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:max-h-[200px] sm:overflow-y-auto pr-1">
              {sortedLeads.map((lead) => (
                <div key={lead._id || lead.name} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm transition hover:border-indigo-100/80">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                    {lead.photo?.url ? (
                      <img
                        src={lead.photo.url}
                        alt={lead.name}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-slate-500 bg-slate-100 text-xs">
                        {lead.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h6 className="text-[13px] font-bold text-slate-900 truncate leading-tight">{lead.name}</h6>
                    <p className="text-[11px] text-slate-500 truncate leading-tight mt-1">{lead.role}</p>
                    <p className="text-[11px] text-indigo-500 font-semibold truncate leading-tight mt-0.5">{lead.iiit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 rounded-xl p-4 text-xs text-slate-400">
            No leads recorded for this term
          </div>
        )}
      </div>
    </div>
  );
}
