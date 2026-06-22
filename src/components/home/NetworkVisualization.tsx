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
  ChevronDown
} from "lucide-react";
import api from "@/lib/apiClient";
import type { ICollege } from "@/types";
import { iiitCampuses } from "@/data/iiitCampuses";
import useThemeMode from "@/hooks/useThemeMode";

type CampusDetails = {
  established: number;
  programs: string[];
  studentStrength: string;
  members: string;
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
    members: "1,200+",
    alumni: "450+",
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
    members: "1,100+",
    alumni: "380+",
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
    members: "950+",
    alumni: "520+",
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
    members: "1,800+",
    alumni: "800+",
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
    members: "600+",
    alumni: "180+",
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
    members: "750+",
    alumni: "240+",
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
    members: "700+",
    alumni: "200+",
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
    members: "680+",
    alumni: "210+",
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
    members: "550+",
    alumni: "150+",
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
    members: "800+",
    alumni: "280+",
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
    members: "350+",
    alumni: "100+",
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
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);

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
  }, []);

  const metrics = [
    { label: "IIIT Campuses", value: "25+", icon: Network, color: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/30 dark:border-indigo-900/40" },
    { label: "Community Members", value: "5,000+", icon: Users, color: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/40" },
    { label: "Connected Alumni", value: "1,200+", icon: Award, color: "text-sky-600 bg-sky-50 border-sky-100 dark:text-sky-400 dark:bg-sky-950/30 dark:border-sky-900/40" },
    { label: "Opportunities Shared", value: "450+", icon: Briefcase, color: "text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900/40" },
    { label: "Events Covered", value: "180+", icon: Calendar, color: "text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/40" },
  ];

  const topCampuses = [
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

    const clubs = (matchedDbCollege?.clubLinks && matchedDbCollege.clubLinks.length > 0)
      ? matchedDbCollege.clubLinks.map(c => c.name)
      : extra.clubs;

    const events = (matchedDbCollege?.gallery && matchedDbCollege.gallery.filter(g => g.category === "events").length > 0)
      ? matchedDbCollege.gallery.filter(g => g.category === "events").map(g => g.caption || "Campus Event")
      : extra.events;

    return {
      established: campusObj?.established || extra.established,
      programs: campusObj?.programs || extra.programs,
      studentStrength: campusObj?.studentStrength || extra.studentStrength,
      members: extra.members,
      alumni: extra.alumni,
      eventsCount: extra.eventsCount,
      oppsCount: extra.oppsCount,
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
  };

  return (
    <section className={`py-16 sm:py-24 border-y transition-colors duration-300 ${
      isDarkMode
        ? "bg-slate-950/40 border-slate-900 text-slate-100"
        : "bg-slate-50/50 border-slate-100 text-slate-900"
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
            Scale & Network
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            A Nationwide Multi-IIIT Ecosystem
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base font-medium">
            Discover a transparent student-led directory, alumni networks, and opportunities bridging IIIT campuses across India.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 duration-300 ${
                  isDarkMode
                    ? "bg-slate-900/50 border-slate-800"
                    : "bg-white border-slate-200/80"
                }`}
              >
                <div className={`inline-flex rounded-xl border p-2.5 ${metric.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-2xl font-black tracking-tight">{metric.value}</h3>
                <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-wider">{metric.label}</p>
              </div>
            );
          })}
        </div>

        {/* Campuses Grid Visualization */}
        <div className={`mt-10 rounded-[2rem] border p-6 shadow-sm sm:p-10 transition-colors duration-300 ${
          isDarkMode
            ? "bg-slate-900/20 border-slate-800"
            : "bg-white border-slate-200/80"
        }`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h3 className="text-lg font-extrabold">Explore Campus Hubs</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Direct community directories</p>
            </div>
            <Link
              href="/colleges"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
            >
              Explore Full Directory
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {topCampuses.map((campus) => {
              const isActive = selectedCampus === campus;
              return (
                <button
                  key={campus}
                  type="button"
                  onClick={() => handleCardClick(campus)}
                  className={`flex items-center justify-between rounded-xl border p-3.5 text-xs font-extrabold shadow-sm transition hover:-translate-y-0.5 duration-200 text-left ${
                    isActive
                      ? isDarkMode
                        ? "border-indigo-500 bg-indigo-950/40 text-indigo-400 font-black"
                        : "border-indigo-300 bg-indigo-50 text-indigo-700 font-black"
                      : isDarkMode
                        ? "border-slate-800/80 bg-slate-900/20 text-slate-300 hover:border-indigo-900/40 hover:bg-indigo-950/20 hover:text-indigo-400"
                        : "border-slate-100 bg-slate-50/30 text-slate-700 hover:border-indigo-100 hover:bg-indigo-50/50 hover:text-indigo-700"
                  }`}
                >
                  <span>{campus}</span>
                  <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                    isActive
                      ? "rotate-90 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-450"
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
                <div className={`mt-8 rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-slate-950/40 border-slate-800 text-slate-100"
                    : "bg-slate-50/60 border-slate-200/60 text-slate-900"
                }`}>
                  {/* Header: Logo, Name, Location */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
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
                    <div className="flex flex-wrap gap-2.5 pt-2 sm:pt-0">
                      <Link
                        href={`/colleges?search=${encodeURIComponent(selectedCampus)}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95 shadow-sm"
                      >
                        Visit Campus Hub
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/opportunities"
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition active:scale-95 shadow-sm ${
                          isDarkMode
                            ? "border-slate-800 text-slate-300 hover:bg-slate-900"
                            : "border-slate-200 text-slate-750 bg-white hover:bg-slate-50"
                        }`}
                      >
                        View Opportunities
                      </Link>
                      <Link
                        href="/discuss"
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition active:scale-95 shadow-sm ${
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
                  <div className="mt-6 grid gap-6 md:grid-cols-12">
                    {/* Column 1: Info & Stats */}
                    <div className="md:col-span-7 space-y-6">
                      <div>
                        <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">About Campus</h5>
                        <p className="mt-2 text-sm leading-relaxed font-medium text-slate-600 dark:text-slate-350">{activeDetails.description}</p>
                      </div>

                      {/* Info Cards */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className={`rounded-xl border p-3.5 transition ${
                          isDarkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-white/80 border-slate-200/50"
                        }`}>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="h-4 w-4 text-indigo-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Established</span>
                          </div>
                          <p className="mt-1 text-base font-extrabold tracking-tight">{activeDetails.established}</p>
                        </div>
                        <div className={`rounded-xl border p-3.5 transition ${
                          isDarkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-white/80 border-slate-200/50"
                        }`}>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Users className="h-4 w-4 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Members</span>
                          </div>
                          <p className="mt-1 text-base font-extrabold tracking-tight">{activeDetails.members}</p>
                        </div>
                        <div className={`rounded-xl border p-3.5 transition ${
                          isDarkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-white/80 border-slate-200/50"
                        }`}>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Award className="h-4 w-4 text-sky-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Alumni</span>
                          </div>
                          <p className="mt-1 text-base font-extrabold tracking-tight">{activeDetails.alumni}</p>
                        </div>
                        <div className={`rounded-xl border p-3.5 transition ${
                          isDarkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-white/80 border-slate-200/50"
                        }`}>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Briefcase className="h-4 w-4 text-amber-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Opps Shared</span>
                          </div>
                          <p className="mt-1 text-base font-extrabold tracking-tight">{activeDetails.oppsCount}</p>
                        </div>
                        <div className={`rounded-xl border p-3.5 transition ${
                          isDarkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-white/80 border-slate-200/50"
                        }`}>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Calendar className="h-4 w-4 text-rose-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Events</span>
                          </div>
                          <p className="mt-1 text-base font-extrabold tracking-tight">{activeDetails.eventsCount}</p>
                        </div>
                        <div className={`rounded-xl border p-3.5 transition ${
                          isDarkMode ? "bg-slate-900/30 border-slate-800/80" : "bg-white/80 border-slate-200/50"
                        }`}>
                          <div className="flex items-center gap-2 text-slate-400">
                            <BookOpen className="h-4 w-4 text-indigo-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Size</span>
                          </div>
                          <p className="mt-1 text-base font-extrabold tracking-tight">{activeDetails.studentStrength}</p>
                        </div>
                      </div>

                      {/* Programs */}
                      <div>
                        <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">Programs Offered</h5>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {activeDetails.programs.map((prog) => (
                            <span
                              key={prog}
                              className={`rounded-full px-3 py-1 text-[11px] font-extrabold border ${
                                isDarkMode
                                  ? "bg-slate-900 border-slate-800 text-slate-300"
                                  : "bg-white border-slate-200 text-slate-650"
                              }`}
                            >
                              {prog}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Clubs & Events lists */}
                    <div className="md:col-span-5 grid gap-5 sm:grid-cols-2 md:grid-cols-1">
                      {/* Clubs */}
                      <div className={`rounded-2xl border p-5 transition ${
                        isDarkMode ? "bg-slate-900/20 border-slate-800/60" : "bg-slate-50/20 border-slate-200/60"
                      }`}>
                        <h5 className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          <Building2 className="h-4 w-4" />
                          Student Clubs
                        </h5>
                        <ul className="mt-3.5 space-y-2.5">
                          {activeDetails.clubs.map((club, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                              <span>{club}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Events */}
                      <div className={`rounded-2xl border p-5 transition ${
                        isDarkMode ? "bg-slate-900/20 border-slate-800/60" : "bg-slate-50/20 border-slate-200/60"
                      }`}>
                        <h5 className="flex items-center gap-1.5 text-xs font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                          <Sparkles className="h-4 w-4" />
                          Campus Events
                        </h5>
                        <ul className="mt-3.5 space-y-2.5">
                          {activeDetails.events.map((event, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                              <span>{event}</span>
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
