"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  MessageSquare,
  Users2,
  Building2,
  ShieldCheck,
  GraduationCap,
  Calendar,
  Camera,
  Linkedin,
  Instagram,
} from "lucide-react";

import api from "@/lib/apiClient";

const BASE_VIEW_COUNT = 27385;

export default function Footer() {
  const [stats, setStats] = useState({
    views: BASE_VIEW_COUNT,
    members: 0,
    legacy: 0,
    colleges: 0,
    clubs: 31,
    events: 0,
    photos: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const trackView = async () => {
      try {
        const res = await api.post("/site-stats/increment");
        if (res.data?.totalViews) {
          setStats((p) => ({ ...p, views: res.data.totalViews }));
        }
      } catch {
        loadStats();
      }
    };

    const loadStats = async () => {
      try {
        const [
          teamRes,
          collegesRes,
          clubsRes,
          siteStatsRes,
          legacyRes,
          eventsRes,
        ] = await Promise.allSettled([
          api.get("/team"),
          api.get("/colleges"),
          api.get("/discuss-accounts/public"),
          api.get("/site-stats"),
          api.get("/alumni"),
          api.get("/events?limit=1000"),
        ]);

        setStats((prev) => {
          const members = teamRes.status === "fulfilled" ? teamRes.value.data?.length || 0 : 0;
          const colleges = collegesRes.status === "fulfilled" ? collegesRes.value.data?.length || 0 : 0;
          const clubs = clubsRes.status === "fulfilled" ? clubsRes.value.data?.length || 31 : 31;
          const views = siteStatsRes.status === "fulfilled" ? siteStatsRes.value.data?.totalViews || prev.views : prev.views;
          const legacy =
            legacyRes.status === "fulfilled"
              ? Array.isArray(legacyRes.value.data)
                ? legacyRes.value.data.length || 0
                : legacyRes.value.data?.pagination?.total ||
                  legacyRes.value.data?.alumni?.length ||
                  0
              : 0;
          
          let events = 0;
          if (eventsRes.status === "fulfilled" && eventsRes.value.data) {
            if (Array.isArray(eventsRes.value.data)) {
              events = eventsRes.value.data.length;
            } else if (Array.isArray(eventsRes.value.data.events)) {
              events = eventsRes.value.data.events.length;
            }
          }

          let photos = 0;
          if (collegesRes.status === "fulfilled" && Array.isArray(collegesRes.value.data)) {
            photos = collegesRes.value.data.reduce(
              (sum: number, c: any) => sum + (Array.isArray(c.gallery) ? c.gallery.length : 0),
              0
            );
          }

          return {
            views,
            members,
            colleges,
            clubs,
            legacy,
            events,
            photos,
          };
        });
      } catch {
        /*silent*/
      }
    };

    trackView();
    loadStats();
  }, []);

  return (
    <footer className="bg-[#0b1329] pb-8 pt-14 text-slate-400">
      <div className="mx-auto max-w-7xl px-6">
        {/* Network Reach Card */}
        <div className="mb-12 rounded-[1.75rem] border border-slate-800/80 bg-[#0d162d] px-6 py-6 sm:px-8 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-400">
                Network Reach
              </p>
              <h3 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                {stats.views.toLocaleString()}{" "}
                <span className="text-xl font-medium text-slate-400 sm:text-2xl">
                  total views
                </span>
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatChip icon={Users2} value={stats.members} label="Team" />
              <StatChip icon={GraduationCap} value={stats.legacy} label="Legacy" />
              <StatChip icon={Building2} value={stats.colleges} label="IIITs" />
              <StatChip icon={ShieldCheck} value={stats.clubs} label="Clubs" />
              <StatChip icon={Calendar} value={stats.events} label="Events" />
              <StatChip icon={Camera} value={stats.photos} label="Photos" />
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid gap-10 border-b border-slate-800/80 pb-10 md:grid-cols-5">
          <div className="space-y-4 md:col-span-1">
            <h3 className="text-xl font-bold text-white tracking-tight">IIITians Network</h3>
            <p className="text-sm leading-relaxed text-slate-400">
              A student-led community connecting IIIT students, alumni, and aspirants across India through data, collaboration, and shared opportunities.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialIcon href="https://linkedin.com/company/iiitians-network" icon={Linkedin} />
              <SocialIcon href="https://instagram.com/iiitiansnetwork" icon={Instagram} />
              <SocialIcon href="https://discord.gg/88AnpuNc6E" icon={MessageSquare} />
              <SocialIcon href="https://iiitiansnetwork.com" icon={Globe} />
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Ecosystem</h4>
            <ul className="space-y-2.5 text-sm font-medium text-slate-400">
              <li><Link href="/colleges" className="transition hover:text-white">IIIT Directory</Link></li>
              <li><Link href="/placement" className="transition hover:text-white">Placements</Link></li>
              <li><Link href="/events" className="transition hover:text-white">Events Desk</Link></li>
              <li><Link href="/discuss" className="transition hover:text-white">Student Discuss</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Community</h4>
            <ul className="space-y-2.5 text-sm font-medium text-slate-400">
              <li><Link href="/legacy" className="transition hover:text-white">Network Legacy</Link></li>
              <li><Link href="/team" className="transition hover:text-white">Our Team</Link></li>
              <li><Link href="/team/join" className="transition hover:text-white">Join the Team</Link></li>
              <li><Link href="/guide" className="transition hover:text-white">User Guide</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Resources</h4>
            <ul className="space-y-2.5 text-sm font-medium text-slate-400">
              <li><Link href="/gallery" className="transition hover:text-white">Gallery</Link></li>
              <li><Link href="/guide" className="transition hover:text-white">Documentation</Link></li>
              <li><Link href="/guide" className="transition hover:text-white">Branding Kit</Link></li>
              <li><Link href="/sitemap" className="transition hover:text-white">Sitemap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Legal</h4>
            <ul className="space-y-2.5 text-sm font-medium text-slate-400">
              <li><Link href="/" className="transition hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/" className="transition hover:text-white">Terms of Use</Link></li>
              <li><Link href="/" className="transition hover:text-white">Community Guidelines</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Contact Us</Link></li>
              <li><Link href="/admin" className="transition hover:text-white">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-wrap gap-1.5 items-center text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wider">
            <span>CREATED BY</span>
            <a href="https://www.linkedin.com/in/ankurrr27/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">ANKUR</a>
            <span className="text-slate-700 font-black">·</span>
            <a href="https://linkedin.com/in/srishti-singh19/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">SRISHTI</a>
            <span className="text-slate-700 font-black">·</span>
            <a href="https://linkedin.com/in/utkarsh-pratap-460502251/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">UTKARSH</a>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wider">
            <span>&copy; {new Date().getFullYear()} IIITIANS NETWORK</span>
            <span className="text-slate-700 hidden sm:inline font-black">|</span>
            <span>BUILT BY IIITIANS, FOR IIITIANS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const StatChip = ({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) => (
  <div className="flex items-center gap-2 rounded-full border border-slate-800/80 bg-[#0b1329]/50 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/5 shadow-sm">
    <Icon size={14} className="text-indigo-400" />
    <span className="font-bold text-white">{value}</span>
    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
  </div>
);

const SocialIcon = ({ href, icon: Icon }: { href: string; icon: React.ElementType }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-slate-400 transition-colors duration-200 hover:text-white hover:scale-105 transform">
    <Icon size={18} />
  </a>
);
