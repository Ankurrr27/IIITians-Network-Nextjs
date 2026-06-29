"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  Users,
  Award,
  Briefcase,
  Calendar,
  ChevronRight,
  MapPin,
  Clock,
  BookOpen,
  ArrowUpRight,
  MessageSquare,
  Building2,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Search
} from "lucide-react";
import api from "@/lib/apiClient";
import type { ICollege, IClub } from "@/types";
import { iiitCampuses } from "@/data/iiitCampuses";
import useThemeMode from "@/hooks/useThemeMode";

type CampusDetails = {
  established: number;
  programs: string[];
  studentStrength: string;
  intake: string;
  alumni: string;
  eventsCount: string;
  oppsCount: string;
  clubs: string[];
  events: string[];
  city: string;
  state: string;
};

const campusExtraDetails: Record<string, CampusDetails> = {
  "IIIT Allahabad": {
    established: 1999,
    programs: ["B.Tech", "M.Tech", "MBA", "Ph.D"],
    studentStrength: "3,000+",
    intake: "500+",
    alumni: "7,500+",
    eventsCount: "45+",
    oppsCount: "80+",
    clubs: ["GeekHaven (Coding)", "Tesla (Electronics)", "Acoustica (Music)", "Prayaas (Social Wing)", "Virtuosi (Dance)"],
    events: ["Effervescence (Annual Cultural Fest)", "HackInTheNorth (Hackathon)", "Asmita (Sports Meet)"],
    city: "Prayagraj",
    state: "Uttar Pradesh",
  },
  "IIIT Delhi": {
    established: 2008,
    programs: ["B.Tech", "M.Tech", "Ph.D"],
    studentStrength: "2,500+",
    intake: "600+",
    alumni: "4,500+",
    eventsCount: "38+",
    oppsCount: "75+",
    clubs: ["Foobar (Coding)", "Byld (Software Dev)", "AudioBytes (Music)", "MadToes (Dance)"],
    events: ["Odyssey (Annual Cultural Fest)", "Esya (Annual Tech Fest)", "HackIIITD"],
    city: "New Delhi",
    state: "Delhi",
  },
  "IIIT Gwalior": {
    established: 1997,
    programs: ["B.Tech", "IPG", "M.Tech", "MBA", "Ph.D"],
    studentStrength: "2,200+",
    intake: "400+",
    alumni: "6,500+",
    eventsCount: "35+",
    oppsCount: "60+",
    clubs: ["AASF (Technical)", "Rotaract Club", "Music Club", "E-Cell (Entrepreneurship)"],
    events: ["Aurora (Annual Fest)", "Infotsav (Tech Fest)", "Hackschooling"],
    city: "Gwalior",
    state: "Madhya Pradesh",
  },
  "IIIT Hyderabad": {
    established: 1998,
    programs: ["B.Tech", "MS", "M.Tech", "Ph.D"],
    studentStrength: "2,000+",
    intake: "400+",
    alumni: "8,500+",
    eventsCount: "60+",
    oppsCount: "120+",
    clubs: ["Programming Club", "Robotics Club", "Literary Club", "Astronomy Club"],
    events: ["Felicity (Annual Fest)", "Megathon (Hackathon)", "R&D Showcase"],
    city: "Hyderabad",
    state: "Telangana",
  },
  "IIIT Kota": {
    established: 2013,
    programs: ["B.Tech", "Ph.D"],
    studentStrength: "900+",
    intake: "200+",
    alumni: "1,400+",
    eventsCount: "20+",
    oppsCount: "35+",
    clubs: ["Cerebro (Coding)", "Inspiral (Literary)", "Beatles (Music)", "E-Cell"],
    events: ["Tiara (Annual Tech-Cultural Fest)", "Local Hack Day", "Kota Code Sprint"],
    city: "Kota",
    state: "Rajasthan",
  },
  "IIIT Lucknow": {
    established: 2015,
    programs: ["B.Tech", "M.Tech", "MBA", "Ph.D"],
    studentStrength: "1,100+",
    intake: "300+",
    alumni: "1,200+",
    eventsCount: "25+",
    oppsCount: "50+",
    clubs: ["Axon (Coding)", "Crochet (Design)", "Ignis (Dance)", "Zephyr (Music)"],
    events: ["Equinox (Annual Fest)", "Lucknow Hackathon", "Enspire (E-Summit)"],
    city: "Lucknow",
    state: "Uttar Pradesh",
  },
  "IIIT Nagpur": {
    established: 2016,
    programs: ["B.Tech", "Ph.D"],
    studentStrength: "1,200+",
    intake: "400+",
    alumni: "1,600+",
    eventsCount: "22+",
    oppsCount: "40+",
    clubs: ["Probe (Coding)", "Velocity (Dance)", "Crispr (Technical)", "Orator (Literary)"],
    events: ["Tantra (Tech Fest)", "Abhivyakti (Cultural Fest)", "Nagpur Code Fest"],
    city: "Nagpur",
    state: "Maharashtra",
  },
  "IIIT Pune": {
    established: 2016,
    programs: ["B.Tech", "Ph.D"],
    studentStrength: "900+",
    intake: "250+",
    alumni: "1,100+",
    eventsCount: "24+",
    oppsCount: "45+",
    clubs: ["Byte Syndicate (Coding)", "Bit Legion (Cybersecurity)", "Aarohan (Cultural)"],
    events: ["Conflux (Annual Tech-Cultural Fest)", "Pune Hackathon", "Innovate-A-Thon"],
    city: "Pune",
    state: "Maharashtra",
  },
  "IIIT Ranchi": {
    established: 2016,
    programs: ["B.Tech", "Ph.D"],
    studentStrength: "800+",
    intake: "200+",
    alumni: "1,100+",
    eventsCount: "18+",
    oppsCount: "30+",
    clubs: ["Coders Club", "Bit-by-Bit (Tech)", "Symphony (Music)", "Grooves (Dance)"],
    events: ["Kartavya (Annual Fest)", "Ranchi Code Hack", "Tech-Srijan"],
    city: "Ranchi",
    state: "Jharkhand",
  },
  "IIIT Sri City": {
    established: 2013,
    programs: ["B.Tech", "M.Tech", "Ph.D"],
    studentStrength: "1,200+",
    intake: "300+",
    alumni: "2,000+",
    eventsCount: "28+",
    oppsCount: "55+",
    clubs: ["DotSlash (Coding)", "Astronomy Club", "In-Sync (Dance)", "Octaves (Music)"],
    events: ["Abhisarga (Annual Cultural Fest)", "IIITS Hackathon", "Tech-Genesis"],
    city: "Sri City",
    state: "Andhra Pradesh",
  },
};

const getFallbackDetails = (name: string): CampusDetails => {
  return {
    established: 2015,
    programs: ["B.Tech", "Ph.D"],
    studentStrength: "800+",
    intake: "250+",
    alumni: "1,000+",
    eventsCount: "15+",
    oppsCount: "25+",
    clubs: ["Coding Club", "Cultural Club", "E-Cell"],
    events: ["Annual College Fest", "Internal Hackathon"],
    city: "India",
    state: "India",
  };
};

export default function NetworkVisualization() {
  const { isDarkMode } = useThemeMode();
  const [dbColleges, setDbColleges] = useState<ICollege[]>([]);
  const [dbClubs, setDbClubs] = useState<IClub[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailTab, setDetailTab] = useState<"programs" | "clubs" | "events">("programs");

  // Fetch db colleges to enrich metadata
  useEffect(() => {
    api.get("/colleges")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setDbColleges(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch colleges for NetworkVisualization:", err);
      });
      
    api.get("/clubs")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setDbClubs(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch clubs for NetworkVisualization:", err);
      });
  }, []);

  const displayedCampuses = useMemo(() => {
    if (searchQuery.trim().length === 0) {
      return [
        "IIIT Allahabad",
        "IIIT Delhi",
        "IIIT Gwalior",
        "IIIT Hyderabad",
        "IIIT Kota",
        "IIIT Lucknow",
        "IIIT Nagpur",
        "IIIT Pune",
        "IIIT Ranchi",
        "IIIT Sri City",
      ];
    }
    const q = searchQuery.toLowerCase();
    return iiitCampuses
      .filter((c) => c.name.toLowerCase().includes(q) || (c.city && c.city.toLowerCase().includes(q)))
      .map((c) => c.name)
      .slice(0, 10);
  }, [searchQuery]);

  // Match the selected campus to the database college record
  const matchedDbCollege = useMemo(() => {
    if (!selectedCampus) return null;
    return dbColleges.find((col) => {
      const campusName = selectedCampus.toLowerCase().replace(/[^a-z0-9]/g, "");
      const collegeName = (col.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return collegeName === campusName || collegeName.includes(campusName) || campusName.includes(collegeName);
    });
  }, [selectedCampus, dbColleges]);

  // Combine database values and fallback definitions
  const activeDetails = useMemo(() => {
    if (!selectedCampus) return null;
    const extra = campusExtraDetails[selectedCampus] || getFallbackDetails(selectedCampus);
    const campusObj = iiitCampuses.find(c => c.name === selectedCampus) || iiitCampuses.find(c => c.name.includes(selectedCampus));

    // Only use real DB club data — no hardcoded fallback
    let clubs: { name: string; link?: string }[] = [];
    if (matchedDbCollege) {
      const collegeClubs = dbClubs.filter(c => c.collegeId === matchedDbCollege._id);
      if (collegeClubs.length > 0) {
        clubs = collegeClubs.map(c => ({ name: c.name, link: `/clubs/${c._id}` }));
      } else if (matchedDbCollege.clubLinks && matchedDbCollege.clubLinks.length > 0) {
        clubs = matchedDbCollege.clubLinks.map(c => ({ name: c.name, link: c.link }));
      }
    }

    let events: { title: string; url?: string }[] = extra.events.map(title => ({ title }));
    if (matchedDbCollege?.gallery && matchedDbCollege.gallery.filter(g => g.category === "events").length > 0) {
      events = matchedDbCollege.gallery.filter(g => g.category === "events").map(g => ({
        title: g.caption || "Campus Event",
        url: g.url
      }));
    }

    return {
      established: campusObj?.established || extra.established,
      programs: campusObj?.programs || extra.programs,
      studentStrength: campusObj?.studentStrength || extra.studentStrength,
      intake: extra.intake,
      clubs,
      events,
      description: matchedDbCollege?.description || campusObj?.description || "Connecting students, alumni, and recruiters across the Indian Institute of Information Technology network.",
      logo: matchedDbCollege?.logo?.url || campusObj?.logo || null,
      city: campusObj?.city || extra.city,
      state: campusObj?.state || extra.state,
    };
  }, [selectedCampus, matchedDbCollege]);

  const handleCardClick = (campus: string) => {
    setSelectedCampus((prev) => (prev === campus ? null : campus));
    setDetailTab("programs");
  };

  return (
    <section className={`py-12 sm:py-16 border-y transition-colors duration-300 ${
      isDarkMode
        ? "bg-slate-950/40 border-slate-900 text-slate-100"
        : "bg-slate-50/50 border-slate-100 text-slate-900"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-left">
          <h2 className="mt-1 sm:mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-slate-100">
            A Nationwide{" "}
            <span className="text-indigo-600"> Ecosystem</span>
          </h2>
        </div>

        {/* Campuses Grid Visualization */}
        <div className={`mt-6 sm:mt-10 -mx-4 sm:mx-0 sm:rounded-[2rem] sm:border px-4 py-2 sm:p-10 sm:shadow-sm transition-colors duration-300 ${
          isDarkMode
            ? "sm:bg-slate-900/20 sm:border-slate-800"
            : "sm:bg-white sm:border-slate-200/80"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-8 gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <h3 className="text-lg sm:text-xl font-extrabold">Explore Campus Hubs</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5 sm:mt-1">Direct community directories</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search IIITs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-7 sm:pl-9 pr-3 py-1.5 sm:py-2.5 text-[11px] sm:text-sm rounded-lg sm:rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium ${
                    isDarkMode 
                      ? "bg-slate-900/50 border-slate-700/80 text-slate-200 placeholder:text-slate-500 focus:bg-slate-900/80" 
                      : "bg-slate-50/50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                  }`}
                />
              </div>
              <Link
                href="/colleges"
                className="inline-flex items-center gap-0.5 text-[10px] sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition shrink-0"
              >
                All
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 sm:gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {displayedCampuses.map((campus, idx) => {
              const isActive = selectedCampus === campus;
              const hideOnMobile = searchQuery.trim().length === 0 && idx >= 6;
              return (
                <button
                  key={campus}
                  type="button"
                  onClick={() => handleCardClick(campus)}
                  className={`${hideOnMobile ? "hidden sm:flex" : "flex"} items-center justify-between rounded-lg sm:rounded-xl border px-2 py-1.5 sm:p-3.5 text-[10px] sm:text-xs font-bold shadow-sm transition hover:-translate-y-0.5 duration-200 text-left ${
                    isActive
                      ? isDarkMode
                        ? "border-indigo-500 bg-indigo-950/40 text-indigo-400"
                        : "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : isDarkMode
                        ? "border-slate-800/80 bg-slate-900/20 text-slate-300 hover:border-indigo-900/40 hover:bg-indigo-950/20 hover:text-indigo-400"
                        : "border-slate-100 bg-slate-50/30 text-slate-600 hover:border-indigo-100 hover:bg-indigo-50/50 hover:text-indigo-700"
                  }`}
                >
                  <span className="truncate">{campus}</span>
                  <ChevronRight className={`h-3 w-3 shrink-0 ml-1 transition-transform duration-200 ${
                    isActive
                      ? "rotate-90 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400"
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Inline Detailed Information Panel */}
          <AnimatePresence mode="wait">
            {selectedCampus && activeDetails && (
              <motion.div
                key={selectedCampus}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className={`mt-4 sm:mt-8 -mx-4 sm:mx-0 sm:rounded-2xl border-y sm:border-y-0 sm:border px-4 py-6 sm:p-8 sm:shadow-sm transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-slate-950/40 border-slate-800 text-slate-100"
                    : "bg-slate-50/60 border-slate-200/60 text-slate-900"
                }`}>
                  {/* Header: Logo, Name, Location */}
                  <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 sm:pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-center gap-4">
                      {activeDetails.logo ? (
                        <img
                          src={activeDetails.logo}
                          alt={`${selectedCampus} Logo`}
                          className="h-14 w-14 object-contain rounded-xl border bg-white p-1.5 border-slate-200/80 dark:border-slate-700"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-slate-200 dark:border-slate-800">
                          <Building2 className="h-7 w-7" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xl font-extrabold tracking-tight">{selectedCampus}</h4>
                        <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-rose-500" />
                          <span>{activeDetails.city}, {activeDetails.state}</span>
                        </div>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 pt-4 sm:pt-0">
                      <Link
                        href={`/colleges?search=${encodeURIComponent(selectedCampus)}`}
                        className="inline-flex justify-center items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95 shadow-sm w-full sm:w-auto"
                      >
                        Visit Campus Hub
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/opportunities"
                        className={`inline-flex justify-center items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition active:scale-95 shadow-sm w-full sm:w-auto ${
                          isDarkMode
                            ? "border-slate-800 text-slate-300 hover:bg-slate-900"
                            : "border-slate-200 text-slate-750 bg-white hover:bg-slate-50"
                        }`}
                      >
                        View Opportunities
                      </Link>
                      <Link
                        href="/discuss"
                        className={`inline-flex justify-center items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition active:scale-95 shadow-sm w-full sm:w-auto ${
                          isDarkMode
                            ? "border-slate-800 text-slate-300 hover:bg-slate-900"
                            : "border-slate-200 text-slate-750 bg-white hover:bg-slate-50"
                        }`}
                      >
                        Join Community
                      </Link>
                    </div>
                  </div>

                  {/* Body Content */}

                  {/* ── MOBILE: tab selector for Programs / Clubs / Events ── */}
                  <div className="mt-3 sm:hidden">
                    {/* Description */}
                    <p className="mb-3 text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                      {activeDetails.description}
                    </p>
                    {/* Tab pills — hide Clubs tab if no DB clubs */}
                    <div className={`inline-flex w-full gap-0.5 rounded-lg border p-0.5 ${
                      isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-slate-100/80 border-slate-200"
                    }`}>
                      {([
                        { key: "programs", label: "Programs", icon: BookOpen },
                        ...(activeDetails.clubs.length > 0 ? [{ key: "clubs" as const, label: "Clubs", icon: Building2 }] : []),
                        { key: "events", label: "Events", icon: Sparkles },
                      ] as { key: "programs" | "clubs" | "events"; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon2 }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setDetailTab(key)}
                          className={`flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-bold transition-all duration-200 ${
                            detailTab === key
                              ? "bg-indigo-600 text-white shadow-sm"
                              : isDarkMode
                                ? "text-slate-400 hover:text-slate-200"
                                : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <Icon2 className="h-2.5 w-2.5 shrink-0" />
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Animated tab content */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={detailTab}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="mt-2"
                      >
                        {detailTab === "programs" && (
                          <ul className="space-y-1.5">
                            {activeDetails.programs.map((prog) => (
                              <li key={prog} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-350">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                                {prog}
                              </li>
                            ))}
                          </ul>
                        )}

                        {detailTab === "clubs" && (
                          <ul className="space-y-2">
                            {activeDetails.clubs.slice(0, 5).map((club, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                                {club.link ? (
                                  <Link href={club.link} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                                    {club.name}
                                    <ExternalLink size={10} className="opacity-50" />
                                  </Link>
                                ) : (
                                  <span>{club.name}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {detailTab === "events" && (
                          <ul className="space-y-2">
                            {activeDetails.events.slice(0, 5).map((event, idx) => (
                              <li key={idx} className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                                <div className="flex items-start gap-2">
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                                  <span>{event.title}</span>
                                </div>
                                {event.url && (
                                  <Link href={event.url} target="_blank" rel="noopener noreferrer"
                                    className="shrink-0 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 transition-colors"
                                    title="View Event Image"
                                  >
                                    <ExternalLink size={12} />
                                  </Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* ── DESKTOP: original full grid ── */}
                  <div className="hidden sm:grid mt-6 gap-6 md:grid-cols-12">
                    {/* Column 1: Info & Stats */}
                    <div className="md:col-span-7 space-y-6">
                      <div>
                        <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">About Campus</h5>
                        <p className="mt-2 text-sm leading-relaxed font-medium text-slate-600 dark:text-slate-350">{activeDetails.description}</p>
                      </div>

                      {/* Info Cards */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className={`rounded-xl border p-3.5 transition ${
                          isDarkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-white/80 border-slate-200/50"
                        }`}>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Estd</span>
                          </div>
                          <p className="mt-1 text-base font-extrabold tracking-tight">{activeDetails.established}</p>
                        </div>
                        <div className={`rounded-xl border p-3.5 transition ${
                          isDarkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-white/80 border-slate-200/50"
                        }`}>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Users className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Intake</span>
                          </div>
                          <p className="mt-1 text-base font-extrabold tracking-tight">{activeDetails.intake}</p>
                        </div>
                        <div className={`rounded-xl border p-3.5 transition ${
                          isDarkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-white/80 border-slate-200/50"
                        }`}>
                          <div className="flex items-center gap-2 text-slate-400">
                            <BookOpen className="h-4 w-4 text-indigo-500 shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Students</span>
                          </div>
                          <p className="mt-1 text-base font-extrabold tracking-tight">{activeDetails.studentStrength}</p>
                        </div>
                      </div>

                      {/* Programs */}
                      <div>
                        <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Programs Offered</h5>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {activeDetails.programs.map((prog) => (
                            <span key={prog} className={`rounded-full px-3 py-1 text-[11px] font-extrabold border ${
                              isDarkMode ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-650"
                            }`}>{prog}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Clubs & Events */}
                    <div className="md:col-span-5 grid gap-5 sm:grid-cols-2 md:grid-cols-1">
                      <div>
                        <h5 className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                          <Building2 className="h-4 w-4" />
                          Student Clubs
                        </h5>
                        {activeDetails.clubs.length > 0 ? (
                          <ul className="mt-3.5 space-y-2.5">
                            {activeDetails.clubs.slice(0, 5).map((club, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                                {club.link ? (
                                  <Link href={club.link} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                                    {club.name}<ExternalLink size={10} className="opacity-50" />
                                  </Link>
                                ) : <span>{club.name}</span>}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-xs font-medium text-slate-400 dark:text-slate-500 italic">
                            No clubs registered yet
                          </p>
                        )}
                      </div>
                      <div className="pt-2 sm:pt-0">
                        <h5 className="flex items-center gap-1.5 text-xs font-extrabold text-rose-600 uppercase tracking-wider">
                          <Sparkles className="h-4 w-4" />
                          Campus Events
                        </h5>
                        <ul className="mt-3.5 space-y-2.5">
                          {activeDetails.events.slice(0, 5).map((event, idx) => (
                            <li key={idx} className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                              <div className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                                <span>{event.title}</span>
                              </div>
                              {event.url && (
                                <Link href={event.url} target="_blank" rel="noopener noreferrer"
                                  className="shrink-0 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 transition-colors"
                                  title="View Event Image"
                                >
                                  <ExternalLink size={12} />
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
