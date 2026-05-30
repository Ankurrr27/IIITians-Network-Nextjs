"use client";

import { useEffect, useState } from "react";
import {
  FolderTree,
  Settings,
  Users2,
  Building2,
  ArrowRight,
  Camera,
  Calendar,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/apiClient";
import type { ICollege } from "@/types";
import AdminLayout from "@/components/AdminLayout";

export default function AdminSitemapPage() {
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await api.get<ICollege[]>("/colleges");
        setColleges(res.data || []);
      } catch (error) {
        console.error("Error fetching colleges for admin sitemap:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  const adminSections = [
    {
      title: "Content & Assets",
      icon: Building2,
      links: [
        { name: "Colleges Directory", path: "/colleges/admin", desc: "Manage IIITs and their details" },
        { name: "Global Events", path: "/events/admin", desc: "Create and update events" },
        { name: "Platform Gallery", path: "/admin/gallery", desc: "Review and manage site images" },
      ],
    },
    {
      title: "Users & Community",
      icon: Users2,
      links: [
        { name: "Team Directory", path: "/team/admin", desc: "Manage core team members" },
        { name: "Network Legacy", path: "/legacy/admin", desc: "Approve legacy/alumni submissions" },
        { name: "Student Discuss", path: "/discuss/admin", desc: "Moderate student discussions" },
      ],
    },
    {
      title: "System & Operations",
      icon: Settings,
      links: [
        { name: "Placement Records", path: "/placement/admin", desc: "Update placement stats" },
        { name: "System Notifications", path: "/admin/notifications", desc: "Broadcast app notifications" },
        { name: "Admin Guide", path: "/admin/guide", desc: "Read operational procedures" },
      ],
    },
  ];

  return (
    <AdminLayout>
    <div className="w-full px-2 py-4 sm:px-0">
      <div className="mb-6 flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 shadow-sm w-fit">
          <FolderTree size={16} />
          Workflow Overview
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Admin Sitemap</h1>
        <p className="text-slate-600 font-medium text-sm">
          A centralized overview of the administrative workflow and management routes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="rounded-[1.15rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.7))] p-4 shadow-[0_20px_60px_rgba(148,163,184,0.12)] backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                <section.icon size={19} />
              </div>
              <h2 className="text-base font-bold text-slate-900">{section.title}</h2>
            </div>
            <div className="flex flex-col gap-2">
              {section.links.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="group block rounded-lg border border-slate-100 bg-white/60 p-3 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900 transition-colors group-hover:text-indigo-700">
                      {link.name}
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500"
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{link.desc}</div>
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dynamic Colleges Section for Admins */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 rounded-[1.25rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.7))] p-4 shadow-[0_20px_60px_rgba(148,163,184,0.12)] backdrop-blur-sm sm:p-5"
      >
        <div className="mb-6 flex flex-col gap-3 border-b border-indigo-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Detailed College Management</h2>
              <p className="text-slate-600 font-medium text-sm">Direct administrative workflows for individual IIITs</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          </div>
        ) : colleges.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colleges.map((college) => {
              const encodeName = encodeURIComponent(college.name);

              return (
                <div
                  key={college._id}
                  className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="mb-4 text-base font-bold text-slate-900">{college.name}</div>
                  <div className="flex flex-col gap-2.5 border-l-2 border-indigo-100 pl-3">
                    <Link
                      href={`/colleges/admin?college=${encodeName}`}
                      className="group flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-indigo-700"
                    >
                      <div className="rounded-lg bg-indigo-50 p-2 ring-1 ring-indigo-100 transition-colors group-hover:bg-indigo-100">
                        <Building2 size={16} className="text-indigo-600" />
                      </div>
                      Manage Details & Clubs
                    </Link>
                    <Link
                      href={`/admin/gallery?college=${encodeName}`}
                      className="group flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-indigo-700"
                    >
                      <div className="rounded-lg bg-sky-50 p-2 ring-1 ring-sky-100 transition-colors group-hover:bg-sky-100">
                        <Camera size={16} className="text-sky-600" />
                      </div>
                      Manage Gallery
                    </Link>
                    <Link
                      href={`/events/admin?college=${encodeName}`}
                      className="group flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-indigo-700"
                    >
                      <div className="rounded-lg bg-amber-50 p-2 ring-1 ring-amber-100 transition-colors group-hover:bg-amber-100">
                        <Calendar size={16} className="text-amber-600" />
                      </div>
                      Manage Events
                    </Link>
                    <Link
                      href={`/placement/admin?college=${encodeName}`}
                      className="group flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-indigo-700"
                    >
                      <div className="rounded-lg bg-emerald-50 p-2 ring-1 ring-emerald-100 transition-colors group-hover:bg-emerald-100">
                        <Briefcase size={16} className="text-emerald-600" />
                      </div>
                      Manage Placements
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <AlertCircle size={32} className="mb-4 opacity-50" />
            <p>No colleges found in the system to manage.</p>
          </div>
        )}
      </motion.div>
    </div>
    </AdminLayout>
  );
}
