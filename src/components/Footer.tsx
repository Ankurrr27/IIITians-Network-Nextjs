"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe, MessageCircle,
  Users2, Building2, ShieldCheck, Link2,
} from "lucide-react";

import api from "@/lib/apiClient";

const BASE_VIEW_COUNT = 24810;

export default function Footer() {
  const [stats, setStats] = useState({ views: BASE_VIEW_COUNT, members: 0, colleges: 0, clubs: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const trackView = async () => {
      try {
        const res = await api.post("/site-stats/increment");
        if (res.data?.totalViews) setStats((p) => ({ ...p, views: res.data.totalViews }));
      } catch { loadStats(); }
    };

    const loadStats = async () => {
      try {
        const [teamRes, collegesRes, clubsRes, siteStatsRes] = await Promise.allSettled([
          api.get("/team"), api.get("/colleges"), api.get("/discuss-accounts/public"), api.get("/site-stats"),
        ]);
        setStats((prev) => ({
          ...prev,
          members: teamRes.status === "fulfilled" ? teamRes.value.data?.length || 0 : 0,
          colleges: collegesRes.status === "fulfilled" ? collegesRes.value.data?.length || 0 : 0,
          views: siteStatsRes.status === "fulfilled" ? siteStatsRes.value.data?.totalViews || prev.views : prev.views,
          clubs: clubsRes.status === "fulfilled" ? clubsRes.value.data?.length || 0 : 0,
        }));
      } catch { /*silent*/ }
    };

    trackView();
    loadStats();
  }, []);

  return (
    <footer className="bg-slate-900 pb-6 pt-14 text-slate-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 rounded-[1.75rem] border border-slate-700 bg-slate-800/60 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-300">Network Reach</p>
              <h3 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                {stats.views.toLocaleString()}{" "}
                <span className="text-xl font-medium text-slate-400 sm:text-2xl">total views</span>
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatChip icon={Users2} value={stats.members} label="Team" />
              <StatChip icon={Building2} value={stats.colleges} label="IIITs" />
              <StatChip icon={ShieldCheck} value={stats.clubs} label="Clubs" />
            </div>
          </div>
        </div>

        <div className="grid gap-10 border-b border-slate-700 pb-10 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight">IIITians Network</h3>
            <p className="text-sm leading-relaxed text-slate-400">
              A student-led community connecting IIIT students, alumni, and aspirants across India through data, collaboration, and shared opportunities.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialIcon href="https://linkedin.com/company/iiitians-network" icon={Link2} />
              <SocialIcon href="https://instagram.com/iiitiansnetwork" icon={Globe} />
              <SocialIcon href="https://discord.gg/88AnpuNc6E" icon={MessageCircle} />
              <SocialIcon href="https://iiitiansnetwork.com" icon={Globe} />
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Ecosystem</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/colleges" className="transition hover:text-white">IIIT Directory</Link></li>
              <li><Link href="/placement" className="transition hover:text-white">Placements</Link></li>
              <li><Link href="/events" className="transition hover:text-white">Events Desk</Link></li>
              <li><Link href="/discuss" className="transition hover:text-white">Student Discuss</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Community</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/legacy" className="transition hover:text-white">Network Legacy</Link></li>
              <li><Link href="/team" className="transition hover:text-white">Our Team</Link></li>
              <li><Link href="/team/join" className="transition hover:text-white">Join the Team</Link></li>
              <li><Link href="/guide" className="transition hover:text-white">User Guide</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/contact" className="transition hover:text-white">Contact Us</Link></li>
              <li><Link href="/admin" className="transition hover:text-white">Admin Portal</Link></li>
              <li><Link href="/guide?flow=member" className="transition hover:text-white">How it works</Link></li>
              <li><Link href="/" className="transition hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-[11px] font-medium uppercase tracking-wider text-slate-500 sm:flex-row">
          <div className="flex flex-wrap gap-1.5">
            <span>Created by</span>
            <a href="https://www.linkedin.com/in/ankurrr27/" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">Ankur</a>
            <span>•</span>
            <a href="https://linkedin.com/in/srishti-singh19/" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">Srishti</a>
            <span>•</span>
            <a href="https://linkedin.com/in/utkarsh-pratap-460502251/" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">Utkarsh</a>
          </div>
          <div className="flex gap-4">
            <p>&copy; {new Date().getFullYear()} IIITians Network</p>
            <p>Built by IIITians, for IIITians</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

const StatChip = ({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) => (
  <div className="flex items-center gap-2.5 rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/5">
    <Icon size={16} className="text-indigo-400" />
    <span className="font-bold text-white">{value}</span>
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
  </div>
);

const SocialIcon = ({ href, icon: Icon }: { href: string; icon: React.ElementType }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-slate-400 transition-colors hover:text-white">
    <Icon size={18} />
  </a>
);
