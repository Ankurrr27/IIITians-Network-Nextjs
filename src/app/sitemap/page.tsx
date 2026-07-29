"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FolderTree,
  Home,
  Users2,
  BookOpen,
  ChevronRight,
  Building2,
  Camera,
  ShieldCheck,
  AlertCircle,
  Briefcase,
  ShoppingBag,
  GraduationCap,
  User,
  Award,
  PlusCircle,
} from "lucide-react";
import api from "@/lib/apiClient";
import type { ICollege } from "@/types";

export default function SitemapPage() {
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get<ICollege[]>("/colleges");
        setColleges(res.data || []);
      } catch (error) {
        console.error("Error fetching colleges for sitemap:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  const staticGroups = [
    {
      title: "Core Platform",
      icon: Home,
      links: [
        { name: "Home", href: "/" },
        { name: "IIIT Directory", href: "/colleges" },
        { name: "Placements Desk", href: "/placement" },
        { name: "Events Portal", href: "/events" },
        { name: "Student Discuss", href: "/discuss" },
        { name: "Career Opportunities", href: "/opportunities" },
        { name: "Merchandise Store", href: "/merchandise" },
        { name: "Platform Gallery", href: "/gallery" },
      ],
    },
    {
      title: "Community & Network",
      icon: Users2,
      links: [
        { name: "Network Legacy", href: "/legacy" },
        { name: "Alumni Portal", href: "/alumni" },
        { name: "Our Team", href: "/team" },
        { name: "Join the Team", href: "/team/join" },
        { name: "Contact Us", href: "/contact" },
      ],
    },
    {
      title: "Resources & Information",
      icon: BookOpen,
      links: [
        { name: "User Guide", href: "/guide" },
        { name: "Register a Club", href: "/club/register" },
        { name: "Verify Certificates", href: "/legacy/certificate" },
        { name: "User Profile", href: "/profile" },
        { name: "Platform Admin", href: "/admin" },
      ],
    },
  ];

  return (
    <div className="relative min-h-screen bg-[linear-gradient(180deg,_#eef7ff_0%,_#f7fbff_36%,_#f9fcff_100%)] pb-16 pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />

      <div className="relative z-10 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 shadow-sm"
            >
              <FolderTree size={16} />
              Platform Directory
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
            >
              Site Map
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 font-semibold"
            >
              Navigate through the complete structure of the IIITians Network platform.
            </motion.p>
          </div>

          {/* Static Links Grid */}
          <div className="grid gap-6 md:grid-cols-3 mb-16">
            {staticGroups.map((group, idx) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.7))] p-6 shadow-[0_24px_70px_rgba(148,163,184,0.14)] backdrop-blur-sm"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                    <group.icon size={22} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{group.title}</h2>
                </div>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-slate-600 transition-all hover:bg-white hover:text-indigo-700 hover:shadow-sm"
                      >
                        <span className="flex items-center gap-3 font-semibold text-sm">
                          <ChevronRight
                            size={16}
                            className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500"
                          />
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Dynamic Colleges Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.7))] p-8 shadow-[0_24px_70px_rgba(148,163,184,0.14)] backdrop-blur-sm"
          >
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  <Building2 size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">IIIT Directory Structure</h2>
                  <p className="text-slate-600 font-semibold text-sm">
                    Detailed breakdown of college-specific routes
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
              </div>
            ) : colleges.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {colleges.map((college) => {
                  const encodeName = encodeURIComponent(college.name);

                  return (
                    <div
                      key={college._id}
                      className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
                    >
                      <div className="mb-5 text-lg font-bold text-slate-900">
                        {college.name}
                      </div>
                      <div className="flex flex-col gap-3 pl-4 border-l-2 border-indigo-100">
                        <Link
                          href={`/college/${encodeName}/gallery`}
                          className="group flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-indigo-700"
                        >
                          <div className="rounded-lg bg-sky-50 p-2 ring-1 ring-sky-100 transition-colors group-hover:bg-sky-100">
                            <Camera size={16} className="text-sky-600" />
                          </div>
                          College Gallery
                        </Link>
                        <Link
                          href={`/college/${encodeName}/clubs`}
                          className="group flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-indigo-700"
                        >
                          <div className="rounded-lg bg-amber-50 p-2 ring-1 ring-amber-100 transition-colors group-hover:bg-amber-100">
                            <ShieldCheck size={16} className="text-amber-600" />
                          </div>
                          Student Clubs
                        </Link>
                        <Link
                          href={`/placement?college=${encodeName}`}
                          className="group flex items-center gap-3 text-sm font-semibold text-slate-600 hover:text-indigo-700"
                        >
                          <div className="rounded-lg bg-emerald-50 p-2 ring-1 ring-emerald-100 transition-colors group-hover:bg-emerald-100">
                            <Briefcase size={16} className="text-emerald-600" />
                          </div>
                          Placement Records
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <AlertCircle size={32} className="mb-4 opacity-50" />
                <p className="font-semibold text-sm">
                  No college directory data available at the moment.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
