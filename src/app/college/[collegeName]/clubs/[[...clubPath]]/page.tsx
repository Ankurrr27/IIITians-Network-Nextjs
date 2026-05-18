"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Search,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
  ArrowLeft,
  Mail,
  Phone,
  LayoutGrid,
  History,
  Globe,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/apiClient";
import type { ICollege, IDiscussAccount, IEvent } from "@/types";

interface GroupedClub {
  name: string;
  website?: string;
  registrants: IDiscussAccount[];
  isVerified: boolean;
  source: "legacy" | "discuss";
}

export default function CollegeClubsPage() {
  const params = useParams<{ collegeName: string; clubPath?: string[] }>();
  const router = useRouter();

  const collegeName = params.collegeName ? decodeURIComponent(params.collegeName) : "";
  const urlClubName = params.clubPath && params.clubPath[0] ? decodeURIComponent(params.clubPath[0]) : "";

  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [allClubs, setAllClubs] = useState<IDiscussAccount[]>([]);
  const [allEvents, setAllEvents] = useState<IEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedCollegeName = useMemo(
    () => collegeName.toLowerCase(),
    [collegeName]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clgRes, clubRes, eventRes] = await Promise.all([
          api.get("/colleges"),
          api.get("/discuss-accounts/public"),
          api.get("/events?limit=1000"),
        ]);
        setColleges(clgRes.data || []);
        setAllClubs(clubRes.data || []);
        setAllEvents(eventRes.data?.events || (Array.isArray(eventRes.data) ? eventRes.data : []));
      } catch (err) {
        console.error("Failed to fetch college clubs data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentCollege = useMemo(() => {
    return colleges.find((c) => c.name?.toLowerCase() === normalizedCollegeName);
  }, [colleges, normalizedCollegeName]);

  const collegeClubs = useMemo(() => {
    const collegeClubsList = currentCollege?.clubLinks || [];
    const discussClubsForCollege = allClubs.filter(
      (c) => c.collegeName?.toLowerCase() === normalizedCollegeName
    );

    const group: Record<string, GroupedClub> = {};

    collegeClubsList.forEach((link) => {
      const name = link.name?.trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!group[key]) {
        group[key] = {
          name,
          website: link.url,
          registrants: [],
          isVerified: false,
          source: "legacy",
        };
      }
    });

    discussClubsForCollege.forEach((acc) => {
      const name = acc.clubName?.trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!group[key]) {
        group[key] = {
          name,
          website: acc.website,
          registrants: [],
          isVerified: acc.isAuthorized,
          source: "discuss",
        };
      }
      group[key].registrants.push(acc);
      if (acc.isAuthorized) group[key].isVerified = true;
      if (acc.website && !group[key].website) group[key].website = acc.website;
    });

    return Object.values(group).sort(
      (a, b) =>
        (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0) ||
        a.name.localeCompare(b.name)
    );
  }, [currentCollege, allClubs, normalizedCollegeName]);

  const filteredClubs = useMemo(() => {
    if (!searchQuery) return collegeClubs;
    const q = searchQuery.toLowerCase();
    return collegeClubs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.registrants.some((r) => r.contactName?.toLowerCase().includes(q))
    );
  }, [collegeClubs, searchQuery]);

  const selectedClub = useMemo(() => {
    if (!urlClubName) return null;
    const decodedUrlClub = urlClubName.toLowerCase();
    return collegeClubs.find((c) => c.name.toLowerCase() === decodedUrlClub);
  }, [collegeClubs, urlClubName]);

  const clubEvents = useMemo(() => {
    if (!selectedClub) return [];

    const officialEvents = allEvents.filter((e) => {
      const matchClub = e.clubName?.toLowerCase() === selectedClub.name.toLowerCase();
      const isGlobalClub = ["iiitians network", "iiitians admin", "network team"].includes(
        selectedClub.name.toLowerCase()
      );
      const matchCollege = e.collegeName?.toLowerCase() === normalizedCollegeName || isGlobalClub;
      return matchClub && matchCollege;
    });

    const galleryEvents = (currentCollege?.gallery || [])
      .filter(
        (item) =>
          item.category === "events" ||
          item.caption?.toLowerCase().includes(selectedClub.name.toLowerCase())
      )
      .map((item) => ({
        _id: item._id || item.url,
        title: item.caption || `${selectedClub.name} Activity`,
        description: "Legacy milestone captured in college gallery.",
        date: item.createdAt || new Date(0).toISOString(),
        link: item.url,
        isLegacy: true,
        banner: { url: item.url },
      }));

    const combined = [...officialEvents, ...galleryEvents];
    const unique: typeof combined = [];
    const seen = new Set();
    combined.forEach((e) => {
      const key = `${e.title}-${new Date(e.date).getFullYear()}`;
      if (!seen.has(key)) {
        unique.push(e);
        seen.add(key);
      }
    });

    return unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allEvents, normalizedCollegeName, selectedClub, currentCollege]);

  const handleSelectClub = (name: string) => {
    router.push(`/college/${encodeURIComponent(collegeName)}/clubs/${encodeURIComponent(name)}`);
  };

  const handleCloseClub = () => {
    router.push(`/college/${encodeURIComponent(collegeName)}/clubs`);
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="relative min-h-screen bg-[#fcfdfe] pb-16 pt-24 sm:pb-24 sm:pt-32">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8">
          <Link
            href="/colleges"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-indigo-50/55 px-4 py-2 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-50 hover:ring-2 hover:ring-indigo-100 shadow-sm"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Colleges Directory
          </Link>

          <div className="mt-8 max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {collegeName} <span className="font-semibold text-indigo-600">Network</span>
            </h1>
            <p className="mt-3 text-sm font-semibold text-slate-500 sm:text-lg">
              Verified student communities and institutional archives.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <LayoutGrid size={16} />
                Active Communities ({filteredClubs.length})
              </h3>

              <div className="w-full sm:max-w-xs">
                <div className="relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search club or leader..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border-none bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-semibold outline-none transition focus:bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {filteredClubs.length === 0 ? (
                <EmptyState onReset={() => setSearchQuery("")} />
              ) : (
                filteredClubs.map((club, idx) => (
                  <ClubCard
                    key={club.name}
                    club={club}
                    isSelected={selectedClub?.name === club.name}
                    onClick={() => handleSelectClub(club.name)}
                    index={idx}
                  />
                ))
              )}
            </div>
          </div>

          <div className="relative">
            <div className="lg:sticky lg:top-32 h-fit">
              <AnimatePresence mode="wait">
                {!selectedClub ? (
                  <div className="hidden lg:block">
                    <IntroductionCard name={collegeName} />
                  </div>
                ) : (
                  <>
                    <div className="hidden lg:block">
                      <ClubInfoPanel club={selectedClub} onClose={handleCloseClub} />
                    </div>
                    {/* Mobile Full-page Details */}
                    <motion.div
                      key="mobile-detail"
                      initial={{ opacity: 0, x: "100%" }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: "100%" }}
                      className="fixed inset-0 z-[110] bg-white lg:hidden overflow-y-auto"
                    >
                      <ClubInfoPanel
                        club={selectedClub}
                        onClose={handleCloseClub}
                        isMobile
                        events={clubEvents}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Desktop Event History Section */}
        <AnimatePresence>
          {selectedClub && (
            <motion.div
              key={`events-${selectedClub.name}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="mt-16 hidden border-t border-slate-200 pt-16 lg:block"
            >
              <div className="mb-10 flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
                  <History size={28} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Event History Timeline</h2>
                <p className="mt-2 text-sm font-semibold text-slate-400 uppercase tracking-[0.1em]">
                  Visual Milestones of {selectedClub.name}
                </p>
              </div>

              {clubEvents.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center text-sm font-bold uppercase tracking-widest text-slate-300">
                  No timeline data recorded yet
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {clubEvents.map((event, idx) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-100"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50">
                        {event.banner?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={event.banner.url}
                            alt={event.title}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 text-slate-200">
                            <History size={32} strokeWidth={1} />
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent opacity-40 group-hover:opacity-60" />

                        <div className="absolute left-3.5 top-3.5">
                          <div className="rounded-xl bg-white/95 px-2.5 py-1 text-[10px] font-black text-slate-900 shadow-lg backdrop-blur-md">
                            {new Date(event.date).getFullYear()}
                          </div>
                        </div>

                        {"isLegacy" in event && event.isLegacy && (
                          <div className="absolute right-3.5 top-3.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/90 text-white shadow-lg backdrop-blur-sm">
                              <ShieldCheck size={14} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-4 sm:p-5">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-indigo-600">
                          <Calendar size={10} strokeWidth={3} />
                          {new Date(event.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>

                        <h4 className="mt-2 text-base font-bold leading-tight text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {event.title}
                        </h4>

                        <p className="mt-2.5 text-[12px] font-medium leading-relaxed text-slate-500 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="mt-auto pt-5">
                          <div className="flex items-center justify-between">
                            {event.link ? (
                              <a
                                href={event.link}
                                target="_blank"
                                rel="noreferrer"
                                className="group/btn inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-indigo-600 active:scale-95"
                              >
                                <span>Details</span>
                                <ExternalLink
                                  size={12}
                                  className="transition-transform group-hover/btn:translate-x-0.5"
                                />
                              </a>
                            ) : (
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-200">
                                No link
                              </span>
                            )}

                            {"isLegacy" in event && event.isLegacy && (
                              <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-600 opacity-80">
                                Legacy Moment
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 h-1 w-0 bg-indigo-600 transition-all duration-500 group-hover:w-full" />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface ClubCardProps {
  club: GroupedClub;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

function ClubCard({ club, isSelected, onClick, index }: ClubCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.01 }}
      onClick={onClick}
      className={`group relative flex w-full items-center gap-4 rounded-2xl border p-3.5 text-left transition-all duration-300 ${
        isSelected
          ? "border-indigo-600 bg-white shadow-xl shadow-indigo-600/5 ring-1 ring-indigo-600/5 translate-x-1.5"
          : "border-slate-50 bg-white hover:border-indigo-100 hover:bg-slate-50/50 hover:shadow-lg hover:shadow-slate-200/40"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold tracking-tighter transition-all duration-500 ${
          isSelected
            ? "bg-indigo-600 text-white rotate-3"
            : "bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:-rotate-3"
        }`}
      >
        {club.name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3
            className={`truncate text-[15px] font-bold transition-colors ${
              isSelected ? "text-indigo-900" : "text-slate-800"
            }`}
          >
            {club.name}
          </h3>
          {club.isVerified && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
        </div>
        <p className="mt-0.5 flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-1">
            <Users size={12} strokeWidth={3} className={isSelected ? "text-indigo-500" : "text-slate-200"} />
            {club.registrants.length}
          </span>
          <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
          <span className={isSelected ? "text-indigo-500/80" : "text-slate-300"}>
            {club.source === "discuss" ? "Verified" : "Public"}
          </span>
        </p>
      </div>

      <ChevronRight
        className={`h-5 w-5 transition-all duration-300 ${
          isSelected ? "text-indigo-600 translate-x-0.5" : "text-slate-200 group-hover:text-indigo-300"
        }`}
      />
    </motion.button>
  );
}

interface ClubInfoPanelProps {
  club: GroupedClub;
  onClose: () => void;
  isMobile?: boolean;
  events?: any[];
}

function ClubInfoPanel({ club, onClose, isMobile = false, events = [] }: ClubInfoPanelProps) {
  return (
    <div
      className={`flex flex-col bg-white ${
        isMobile
          ? "min-h-screen pb-20"
          : "rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
      }`}
    >
      <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={onClose}
              className="mr-2 h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition-transform active:scale-90"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <p className="truncate text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            {club.name}
          </p>
        </div>
        {!isMobile && (
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 hover:rotate-90"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 p-8 sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{club.name}</h2>
          {club.isVerified && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 uppercase tracking-widest ring-1 ring-emerald-100 shadow-sm">
              Verified
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {club.website && (
            <a
              href={club.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition"
            >
              <Globe size={16} /> Visit Portal
            </a>
          )}
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600">
            <Users size={16} /> {club.registrants.length} Network Contacts
          </div>
        </div>

        <div className="mt-12">
          <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-3">
            Operational Leads
          </h4>
          <div className="mt-6 space-y-4">
            {club.registrants.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-100 p-6 text-center text-sm font-bold text-slate-300">
                No active leads registered
              </div>
            ) : (
              club.registrants.map((reg, i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-lg"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-slate-900 uppercase tracking-tight">
                      {reg.contactName}
                    </p>
                    <p className="truncate text-xs font-bold text-indigo-600/60 mt-0.5">
                      {reg.role.replace("_", " ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {reg.contactPhone && (
                      <a
                        href={`tel:${reg.contactPhone}`}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200 hover:scale-110 transition"
                      >
                        <Phone size={18} />
                      </a>
                    )}
                    <a
                      href={`mailto:${reg.email}`}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200 hover:scale-110 transition"
                    >
                      <Mail size={18} />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {isMobile && events.length > 0 && (
          <div className="mt-12">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-3">
              Milestone Timeline
            </h4>
            <div className="mt-6 space-y-4">
              {events.map((e) => (
                <div key={e._id} className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5">
                  {e.banner?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.banner.url}
                      className="mb-4 aspect-video w-full rounded-2xl object-cover shadow-sm"
                      alt="milestone"
                    />
                  ) : null}
                  <div className="mb-3 inline-block rounded-lg bg-indigo-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                    {new Date(e.date).getFullYear()}
                  </div>
                  <h5 className="text-[15px] font-bold text-slate-900 leading-snug">{e.title}</h5>
                  <p className="mt-2 text-xs font-medium text-slate-500 line-clamp-3">
                    {e.description}
                  </p>
                  {e.link && (
                    <a
                      href={e.link}
                      className="mt-4 block text-[11px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                    >
                      View Documentation ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IntroductionCard({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
      <motion.div
        animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-8 border border-indigo-100 shadow-sm relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
        <Users size={36} className="relative z-10" />
      </motion.div>
      <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Institute Ecosystem</h3>
      <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500 max-w-[280px]">
        Select an entity from {name} to view its verified community records and historical milestones.
      </p>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="py-24 text-center">
      <p className="text-lg font-bold text-slate-300">No organizations matched your search</p>
      <button
        onClick={onReset}
        className="mt-6 rounded-full bg-slate-100 px-6 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
      >
        Reset Search
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-20 pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="h-6 w-40 rounded bg-slate-100 animate-pulse" />
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-50 animate-pulse" />
            ))}
          </div>
          <div className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
