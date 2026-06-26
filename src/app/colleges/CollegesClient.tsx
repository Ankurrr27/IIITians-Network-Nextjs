"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  MoreHorizontal, Link2, ShieldCheck,
  Users, Images, ImagePlus,
  BriefcaseBusiness, History, Globe, ExternalLink,
} from "lucide-react";
import type { ICollege, ITeamMember, IAlumni, IDiscussAccount } from "@/types";
import { notifyPageEntry } from "@/utils/appNotifications";
import PageHeader, { pageHeaderControlClass } from "@/components/PageHeader";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Props {
  initialColleges: ICollege[];
  initialTeamMembers: ITeamMember[];
  initialAlumni: IAlumni[];
  initialDiscussClubs: IDiscussAccount[];
}

const RECENT_COLLEGE_SEARCHES_KEY = "iiitians-network-recent-college-searches";
const COLLEGE_PLACEHOLDER = "/placeholder.svg";

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function CollegesClient({
  initialColleges,
  initialTeamMembers,
  initialAlumni,
  initialDiscussClubs,
}: Props) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filter, setFilter] = useState("NONE");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<ICollege | null>(null);

  useEffect(() => {
    notifyPageEntry("Colleges page loaded", "The IIIT directory is ready to explore.", "page-colleges-loaded");
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_COLLEGE_SEARCHES_KEY) || "[]");
      setRecentSearches(Array.isArray(stored) ? stored.filter(Boolean) : []);
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Sync search state to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [search]);

  // Track recent searches when a college is matched
  useEffect(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch || normalizedSearch.length < 2) return;

    const timer = setTimeout(() => {
      const matched = initialColleges.find(
        (c) => (c.name || "").trim().toLowerCase() === normalizedSearch
      );
      if (!matched) return;

      const nextRecent = [
        matched.name,
        ...recentSearches.filter((s) => s.trim().toLowerCase() !== normalizedSearch),
      ].slice(0, 8);

      setRecentSearches(nextRecent);
      localStorage.setItem(RECENT_COLLEGE_SEARCHES_KEY, JSON.stringify(nextRecent));
    }, 250);

    return () => clearTimeout(timer);
  }, [search, initialColleges, recentSearches]);

  // Filter + sort
  let filtered = initialColleges.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  if (filter === "AZ") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (filter === "ZA") filtered.sort((a, b) => b.name.localeCompare(a.name));
  if (filter === "WEBSITE") filtered = filtered.filter((c) => c.website);
  if (filter === "RECENT") {
    const indexMap = new Map(recentSearches.map((s, i) => [s.trim().toLowerCase(), i]));
    filtered.sort((a, b) => {
      const ia = indexMap.get((a.name || "").trim().toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      const ib = indexMap.get((b.name || "").trim().toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      return ia !== ib ? ia - ib : a.name.localeCompare(b.name);
    });
  }

  // Unique member count per college (same logic as original)
  const getUniqueCollegeMemberCount = (collegeName: string) => {
    const uniqueMembers = new Set<string>();
    const normalize = (name: string) => {
      let n = (name || "").trim().toLowerCase();
      if (n.includes("sricity") || n.includes("sri city") || n === "chittoor" || (n.includes("iiit") && n.includes("chittoor"))) {
        return "iiit sricity_chittoor_canonical";
      }
      return n;
    };
    const targetCollege = normalize(collegeName);
    const addMember = (member: { iiit?: string; email?: string; name?: string }) => {
      if (normalize(member.iiit || "") !== targetCollege) return;
      const key = (member.email || "").trim().toLowerCase() ||
        `${(member.name || "").trim().toLowerCase()}::${normalize(member.iiit || "")}`;
      if (key) uniqueMembers.add(key);
    };
    initialTeamMembers.forEach(addMember);
    initialAlumni.forEach(addMember);
    return uniqueMembers.size;
  };

  return (
    <section className="ui-page-bg relative min-h-screen pb-10 pt-24 sm:pb-12 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />
      <div className="ui-page-shell relative z-10">

        <PageHeader
          title=""
          description=""
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search IIIT by name..."
          filters={
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`${pageHeaderControlClass} w-full sm:w-56`}
            >
              <option value="NONE">Default order</option>
              <option value="AZ">Sort A-Z</option>
              <option value="ZA">Sort Z-A</option>
              <option value="WEBSITE">Has website</option>
              {recentSearches.length > 0 && <option value="RECENT">Recently searched</option>}
            </select>
          }
        />

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="ui-empty">
            <p className="text-sm font-semibold">No colleges found.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {filtered.map((college) => (
              <CollegeCard
                key={college._id}
                college={college}
                teamCount={getUniqueCollegeMemberCount(college.name)}
                discussClubs={initialDiscussClubs.filter(
                  (club) =>
                    (club.collegeName || "").trim().toLowerCase() ===
                    (college.name || "").trim().toLowerCase()
                )}
                onSelect={() => setSelectedCollege(college)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedCollege && (
        <CollegeDetailDrawer
          college={selectedCollege}
          teamCount={getUniqueCollegeMemberCount(selectedCollege.name)}
          discussClubs={initialDiscussClubs.filter(
            (club) =>
              (club.collegeName || "").trim().toLowerCase() ===
              (selectedCollege.name || "").trim().toLowerCase()
          )}
          onClose={() => setSelectedCollege(null)}
        />
      )}
    </section>
  );
}

/* ─── CollegesSearch ─────────────────────────────────────────────────────── */
/* ─── CollegeCard ────────────────────────────────────────────────────────── */
function CollegeCard({
  college, teamCount = 0, discussClubs = [], onSelect,
}: {
  college: ICollege;
  teamCount?: number;
  discussClubs?: IDiscussAccount[];
  onSelect: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{ url: string; caption?: string }[]>(
    college.gallery || []
  );

  const {
    _id: id,
    name,
    description,
    website,
    clubLinks = [],
  } = college;

  const coverImage =
    college.photo?.url ||
    (galleryImages.length > 0 ? galleryImages[0]?.url : undefined) ||
    college.logo?.url ||
    COLLEGE_PLACEHOLDER;
  const logoImage = college.logo?.url || COLLEGE_PLACEHOLDER;

  const [coverSrc, setCoverSrc] = useState(coverImage);
  const [logoSrc, setLogoSrc] = useState(logoImage);

  useEffect(() => { setCoverSrc(coverImage); }, [coverImage]);
  useEffect(() => { setLogoSrc(logoImage); }, [logoImage]);

  const formatExternalLink = (url: string) =>
    url.startsWith("http") ? url : `https://${url}`;

  const visibleClubLinks = (clubLinks as { name: string; url: string }[]).filter(
    (item) => item?.name && item?.url
  );
  const displayClubLinks =
    visibleClubLinks.length > 0
      ? visibleClubLinks
      : college.clubLink
      ? [{ name: "Club / Community", url: college.clubLink }]
      : [];

  const mergedClubs = useMemo(() => {
    const clubsMap = new Map<string, {
      id: string; name: string; url: string;
      source: string; isAuthorized: boolean; badgeLabel: string;
    }>();

    displayClubLinks.forEach((item, index) => {
      const nameKey = item.name.trim().toLowerCase();
      if (!clubsMap.has(nameKey)) {
        clubsMap.set(nameKey, {
          id: `college-${item.name}-${index}`,
          name: item.name,
          url: formatExternalLink(item.url),
          source: "college",
          isAuthorized: false,
          badgeLabel: "",
        });
      }
    });

    discussClubs.forEach((club, index) => {
      const nameKey = (club.clubName || "").trim().toLowerCase();
      if (!clubsMap.has(nameKey) || !clubsMap.get(nameKey)!.isAuthorized) {
        clubsMap.set(nameKey, {
          id: club._id || `discuss-${club.clubName}-${index}`,
          name: club.clubName || "",
          url: formatExternalLink(club.website || ""),
          source: "discuss",
          isAuthorized: Boolean(club.isAuthorized),
          badgeLabel: club.badgeLabel || "Verified by network",
        });
      }
    });

    return Array.from(clubsMap.values());
  }, [displayClubLinks, discussClubs]);

  const hasExpandableDetails =
    (description && description.length > 140) || mergedClubs.length > 0;

  return (
    <div className="ui-card ui-card-hover group flex flex-col">
      {/* Cover image */}
      <div className="relative aspect-[16/7.6] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverSrc}
          alt={`${name} college`}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.1]"
          onError={() => {
            if (coverSrc !== logoImage && college.logo?.url) {
              setCoverSrc(logoImage);
            } else {
              setCoverSrc(COLLEGE_PLACEHOLDER);
            }
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_60%),_linear-gradient(to_top,_rgba(0,0,0,0.2)_0%,_transparent_50%)]" />

        {/* Badge row */}
        <div className="absolute right-3 top-3 z-10 flex flex-wrap justify-end gap-1.5 sm:gap-2">
          <Link
            href={`/college/${encodeURIComponent(name)}/gallery`}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-900/40 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-slate-900/60 active:scale-95 sm:px-3 sm:text-[11px]"
            title="View Gallery"
          >
            <Images className="h-3.5 w-3.5" />
            {galleryImages.length}
          </Link>
          <Link
            href={`/college/${encodeURIComponent(name)}/clubs`}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-emerald-900/40 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-emerald-900/70 active:scale-95 sm:px-3 sm:text-[11px]"
            title="Registered Clubs"
          >
            <Link2 className="h-3.5 w-3.5" />
            {mergedClubs.length}
          </Link>
          <Link
            href={`/team?iiit=${encodeURIComponent(name)}`}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-indigo-900/40 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-indigo-900/60 active:scale-95 sm:px-3 sm:text-[11px]"
            title="Community Team"
          >
            <Users className="h-3.5 w-3.5" />
            {teamCount}
          </Link>
        </div>
      </div>

      {/* Card body */}
      <div className="relative -mt-3 flex flex-1 flex-col rounded-t-[1rem] bg-white p-4 transition-all duration-300 ease-out group-hover:-translate-y-0.5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200 transition-transform group-hover:-translate-y-1 group-hover:rotate-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt={`${name} logo`}
                className="h-9 w-9 object-contain"
                onError={() => setLogoSrc(COLLEGE_PLACEHOLDER)}
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold leading-tight text-gray-900 sm:text-base">{name}</h3>
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="group/link flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 sm:text-[11px]"
                >
                  <Globe size={12} className="shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-[200px]">
                    {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </span>
                  <ExternalLink size={10} className="opacity-0 transition-opacity group-hover/link:opacity-100" />
                </a>
              )}
            </div>
          </div>

          {/* Three-dot menu */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowMenu((p) => !p)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              aria-label={`More options for ${name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="ui-panel absolute right-0 top-11 z-20 w-56 p-2 ring-1 ring-black/5">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  onClick={() => { setShowMenu(false); window.location.href = `/college/${encodeURIComponent(name)}/gallery`; }}
                >
                  <Images className="h-4 w-4 text-indigo-600" /> View Gallery
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  onClick={() => { setShowMenu(false); window.location.href = `/college/${encodeURIComponent(name)}/clubs`; }}
                >
                  <Link2 className="h-4 w-4 text-emerald-600" /> Explore Clubs
                </button>
                <div className="my-1 h-px bg-slate-100" />
                <Link
                  href={`/discuss?mode=register&college=${encodeURIComponent(name)}`}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                  onClick={() => setShowMenu(false)}
                >
                  <Users className="h-4 w-4" /> Register club
                </Link>
                <div className="my-1 h-px bg-slate-100" />
                <Link
                  href="/guide?flow=discuss"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
                  onClick={() => setShowMenu(false)}
                >
                  <ShieldCheck size={16} /> How it works
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mb-2">
            <p className="text-sm leading-6 text-gray-600 line-clamp-3">
              {description}
            </p>
          </div>
        )}

        {hasExpandableDetails && (
          <button
            type="button"
            onClick={onSelect}
            className="mb-3 inline-flex w-fit items-center gap-1 text-[11px] font-bold text-indigo-500 transition hover:text-indigo-700 leading-none"
          >
            See more →
          </button>
        )}

        {/* Bottom action buttons */}
        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-2 sm:gap-1.5">
            <Link
              href={`/college/${encodeURIComponent(name)}/gallery`}
              className="ui-button ui-button-ghost inline-flex min-w-0 flex-col items-center justify-center gap-0.5 whitespace-nowrap py-2.5 text-[9px] uppercase active:scale-95 sm:flex-row sm:gap-1 sm:px-2.5 sm:py-2 sm:text-[10px]"
              style={{ minHeight: "auto" }}
              title="Gallery"
            >
              <Images size={15} className="shrink-0" />
              <span className="text-[8px] sm:text-[10px]">Gallery</span>
            </Link>
            <Link
              href={`/college/${encodeURIComponent(name)}/clubs`}
              className="ui-button ui-button-ghost inline-flex min-w-0 flex-col items-center justify-center gap-0.5 whitespace-nowrap py-2.5 text-[9px] uppercase active:scale-95 sm:flex-row sm:gap-1 sm:px-2.5 sm:py-2 sm:text-[10px]"
              style={{ minHeight: "auto" }}
              title="Clubs"
            >
              <Users size={15} className="shrink-0" />
              <span className="text-[8px] sm:text-[10px]">Clubs</span>
            </Link>
            <Link
              href={`/legacy?iiit=${encodeURIComponent(name)}`}
              className="ui-button ui-button-ghost inline-flex min-w-0 flex-col items-center justify-center gap-0.5 whitespace-nowrap py-2.5 text-[9px] uppercase active:scale-95 sm:flex-row sm:gap-1 sm:px-2.5 sm:py-2 sm:text-[10px]"
              style={{ minHeight: "auto" }}
              title="Legacy"
            >
              <History size={15} className="shrink-0" />
              <span className="text-[8px] sm:text-[10px]">Legacy</span>
            </Link>
            <Link
              href={`/placement?college=${encodeURIComponent(name)}`}
              className="ui-button ui-button-ghost inline-flex min-w-0 flex-col items-center justify-center gap-0.5 whitespace-nowrap py-2.5 text-[9px] uppercase active:scale-95 sm:flex-row sm:gap-1 sm:px-2.5 sm:py-2 sm:text-[10px]"
              style={{ minHeight: "auto" }}
              title="Placement"
            >
              <BriefcaseBusiness size={15} className="shrink-0" />
              <span className="text-[8px] sm:text-[10px]">Placement</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Drawer (Notion/Linear-style peek panel) ──────────────────── */
function CollegeDetailDrawer({
  college,
  teamCount,
  discussClubs,
  onClose,
}: {
  college: ICollege;
  teamCount: number;
  discussClubs: IDiscussAccount[];
  onClose: () => void;
}) {
  const { name, description, website, clubLinks = [] } = college;
  const logoSrc = college.logo?.url || COLLEGE_PLACEHOLDER;

  const formatExternalLink = (url: string) =>
    url.startsWith("http") ? url : `https://${url}`;

  const visibleClubLinks = (clubLinks as { name: string; url: string }[]).filter(
    (item) => item?.name && item?.url
  );
  const displayClubLinks =
    visibleClubLinks.length > 0
      ? visibleClubLinks
      : college.clubLink
      ? [{ name: "Club / Community", url: college.clubLink }]
      : [];

  const mergedClubs = useMemo(() => {
    const clubsMap = new Map<string, {
      id: string; name: string; url: string;
      source: string; isAuthorized: boolean;
    }>();
    displayClubLinks.forEach((item, index) => {
      const k = item.name.trim().toLowerCase();
      if (!clubsMap.has(k)) {
        clubsMap.set(k, {
          id: `college-${item.name}-${index}`, name: item.name,
          url: formatExternalLink(item.url), source: "college", isAuthorized: false,
        });
      }
    });
    discussClubs.forEach((club, index) => {
      const k = (club.clubName || "").trim().toLowerCase();
      if (!clubsMap.has(k) || !clubsMap.get(k)!.isAuthorized) {
        clubsMap.set(k, {
          id: club._id || `discuss-${club.clubName}-${index}`,
          name: club.clubName || "", url: formatExternalLink(club.website || ""),
          source: "discuss", isAuthorized: Boolean(club.isAuthorized),
        });
      }
    });
    return Array.from(clubsMap.values());
  }, [displayClubLinks, discussClubs]);

  const [activeTab, setActiveTab] = useState<"overview" | "gallery" | "clubs" | "legacy" | "placement">("overview");

  const galleryCount = college.gallery?.length ?? 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "gallery" as const, label: "Gallery", count: galleryCount },
    { key: "clubs" as const, label: "Clubs", count: mergedClubs.length },
    { key: "legacy" as const, label: "Legacy" },
    { key: "placement" as const, label: "Placement" },
  ];

  return (
    <>
      {/* Light backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-950/10 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.08)] sm:w-[26rem]"
        style={{ animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt={`${name} logo`} className="h-8 w-8 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-extrabold text-slate-900">{name}</h2>
            {website && (
              <a
                href={formatExternalLink(website)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
              >
                <Globe size={11} />
                <span className="truncate">{website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                <ExternalLink size={9} className="shrink-0" />
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-100 bg-white px-4 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative shrink-0 px-3 py-2.5 text-xs font-bold transition ${
                activeTab === tab.key
                  ? "text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1 text-[10px] font-semibold ${activeTab === tab.key ? "text-indigo-400" : "text-slate-300"}`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-indigo-500" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content — Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* Quick Stats */}
              <div className="flex items-center gap-5 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <Images size={13} className="text-indigo-500" /> {galleryCount} <span className="text-slate-400 font-medium">photos</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <Link2 size={13} className="text-emerald-500" /> {mergedClubs.length} <span className="text-slate-400 font-medium">clubs</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <Users size={13} className="text-indigo-500" /> {teamCount} <span className="text-slate-400 font-medium">members</span>
                </div>
              </div>

              {/* About */}
              {description && (
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">About</h3>
                  <p className="text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-line">{description}</p>
                </div>
              )}

              {/* Clubs preview */}
              {mergedClubs.length > 0 && (
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Registered Clubs</h3>
                    <button type="button" onClick={() => setActiveTab("clubs")} className="text-[10px] font-bold text-indigo-600 hover:underline">
                      View All →
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mergedClubs.slice(0, 6).map((club) => (
                      <Link
                        key={club.id}
                        href={`/college/${encodeURIComponent(name)}/clubs/${encodeURIComponent(club.name)}`}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                          club.source === "discuss"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {club.name}
                        {club.isAuthorized && <ShieldCheck size={12} className="text-emerald-500" />}
                      </Link>
                    ))}
                    {mergedClubs.length > 6 && (
                      <button type="button" onClick={() => setActiveTab("clubs")} className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold text-indigo-500 ring-1 ring-indigo-200 hover:bg-indigo-50">
                        +{mergedClubs.length - 6} more
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <div className="px-5 py-8">
              {galleryCount > 0 ? (
                <div className="text-center">
                  <Images size={32} className="mx-auto mb-3 text-indigo-300" />
                  <p className="text-sm font-semibold text-slate-700 mb-1">{galleryCount} photos available</p>
                  <p className="text-xs text-slate-400 mb-4">Browse the full campus gallery</p>
                  <Link
                    href={`/college/${encodeURIComponent(name)}/gallery`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95"
                  >
                    Open Gallery <ExternalLink size={12} />
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Images size={32} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-sm font-medium text-slate-400">No gallery photos yet</p>
                </div>
              )}
            </div>
          )}

          {/* Clubs Tab */}
          {activeTab === "clubs" && (
            <div className="px-5 py-4">
              {mergedClubs.length > 0 ? (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">All Clubs · {mergedClubs.length}</h3>
                    <Link href={`/college/${encodeURIComponent(name)}/clubs`} className="text-[10px] font-bold text-indigo-600 hover:underline">
                      Full Page →
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mergedClubs.map((club) => (
                      <Link
                        key={club.id}
                        href={`/college/${encodeURIComponent(name)}/clubs/${encodeURIComponent(club.name)}`}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                          club.source === "discuss"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {club.name}
                        {club.isAuthorized && <ShieldCheck size={12} className="text-emerald-500" />}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <Users size={32} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-sm font-medium text-slate-400">No registered clubs yet</p>
                </div>
              )}
            </div>
          )}

          {/* Legacy Tab */}
          {activeTab === "legacy" && (
            <div className="px-5 py-8 text-center">
              <History size={32} className="mx-auto mb-3 text-amber-300" />
              <p className="text-sm font-semibold text-slate-700 mb-1">Alumni & Legacy</p>
              <p className="text-xs text-slate-400 mb-4">Explore notable alumni from {name}</p>
              <Link
                href={`/legacy?iiit=${encodeURIComponent(name)}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-600 active:scale-95"
              >
                View Legacy <ExternalLink size={12} />
              </Link>
            </div>
          )}

          {/* Placement Tab */}
          {activeTab === "placement" && (
            <div className="px-5 py-8 text-center">
              <BriefcaseBusiness size={32} className="mx-auto mb-3 text-rose-300" />
              <p className="text-sm font-semibold text-slate-700 mb-1">Placement Data</p>
              <p className="text-xs text-slate-400 mb-4">View placement statistics for {name}</p>
              <Link
                href={`/placement?college=${encodeURIComponent(name)}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-600 active:scale-95"
              >
                View Placements <ExternalLink size={12} />
              </Link>
            </div>
          )}
        </div>
      </aside>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
