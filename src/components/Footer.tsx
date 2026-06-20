"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Users2,
  Building2,
  ShieldCheck,
  GraduationCap,
  Calendar,
  Camera,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
  Mail,
} from "lucide-react";

import api from "@/lib/apiClient";

const DiscordIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.27 4.73a16.14 16.14 0 0 0-3.8-1.2 11.23 11.23 0 0 0-.46.95 14.83 14.83 0 0 0-6 0 11.72 11.72 0 0 0-.47-.95 16.12 16.12 0 0 0-3.8 1.2 16.32 16.32 0 0 0-3.3 11.2 16.48 16.48 0 0 0 5 2.5 12.27 12.27 0 0 0 1.07-1.74 11.16 11.16 0 0 1-2.48-1.2c.2-.15.42-.3.61-.46a11.75 11.75 0 0 0 12.3 0c.19.16.4.3.61.46a11.17 11.17 0 0 1-2.48 1.2 12.06 12.06 0 0 0 1.07 1.74 16.43 16.43 0 0 0 5-2.5 16.29 16.29 0 0 0-3.26-11.2zm-10.1 8.87c-.96 0-1.74-.87-1.74-1.95s.76-1.95 1.74-1.95c.98 0 1.76.87 1.76 1.95s-.78 1.95-1.76 1.95zm5.66 0c-.96 0-1.74-.87-1.74-1.95s.76-1.95 1.74-1.95c.98 0 1.76.87 1.76 1.95s-.78 1.95-1.76 1.95z" />
  </svg>
);

const RedditIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.23-1.72l1.32-4.18 4.29 1c0 1.1.9 2 2 2 1.1 0 2-.9 2-2s-.9-2-2-2c-.76 0-1.43.43-1.77 1.07l-4.75-1.1c-.26-.06-.52.09-.6.35L10.3 8c-2.42.04-4.66.67-6.32 1.7-.56-.73-1.45-1.2-2.48-1.2-1.65 0-3 1.35-3 3 0 1.14.64 2.13 1.58 2.63-.05.29-.08.59-.08.9 0 3.86 4.7 7 10.5 7s10.5-3.14 10.5-7c0-.31-.03-.61-.08-.9.94-.5 1.58-1.49 1.58-2.63zm-16.5 2c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 4c-1.75 1.5-4.25 1.5-6 0-.18-.15-.2-.42-.05-.6.15-.18.42-.2.6-.05 1.42 1.2 3.88 1.2 5.3 0 .18-.15.45-.13.6.05.15.18.13.45-.05.6zm-.5-2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
  </svg>
);

const BASE_VIEW_COUNT = 27385;

export default function Footer() {
  const pathname = usePathname();
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

  if (pathname.includes("/admin")) return null;

  return (
    <footer className="bg-[#0b1329] pb-6 pt-8 text-slate-400">
      <div className="ui-page-shell">
        {/* Network Reach Card */}
        <div className="mb-7 rounded-xl border border-slate-800/80 bg-[#0d162d] px-4 py-4 shadow-sm sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-400">
                Network Reach
              </p>
              <p className="mt-1.5 text-xl font-bold sm:text-2xl" style={{ color: "#ffffff" }}>
                <span style={{ color: "#ffffff" }}>{stats.views.toLocaleString()}</span>{" "}
                <span className="text-base font-medium sm:text-xl" style={{ color: "#ffffff" }}>
                  total views
                </span>
              </p>
            </div>
            {/* Horizontally scrollable on mobile, wrapping on larger screens */}
            <div className="mobile-scroll-x xl:flex xl:flex-wrap xl:items-center xl:gap-3">
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
        <div className="grid grid-cols-2 gap-6 border-b border-slate-800/80 pb-7 sm:grid-cols-3 md:grid-cols-5">
          <div className="col-span-2 space-y-3 sm:col-span-3 md:col-span-1">
            <p className="text-lg font-bold tracking-tight" style={{ color: "#ffffff" }}>IIITians Network</p>
            <p className="text-[13px] leading-6 text-slate-400">
              A student-led community connecting IIIT students, alumni, and aspirants across India through data, collaboration, and shared opportunities.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <SocialIcon href="https://linkedin.com/company/iiitians-network" color="#0077b5" title="LinkedIn">
                <Linkedin size={17} />
              </SocialIcon>
              <SocialIcon href="https://instagram.com/iiitiansnetwork" color="#e1306c" title="Instagram">
                <Instagram size={17} />
              </SocialIcon>
              <SocialIcon href="https://discord.gg/88AnpuNc6E" color="#5865f2" title="Discord">
                <DiscordIcon size={17} />
              </SocialIcon>
              <SocialIcon href="https://x.com/iiitiansnetwork" color="#ffffff" title="X / Twitter">
                <Twitter size={17} />
              </SocialIcon>
              {/* <SocialIcon href="https://www.youtube.com/@iiitiansnetwork" color="#ff0000" title="YouTube">
                <Youtube size={17} />
              </SocialIcon> */}
              <SocialIcon href="https://reddit.com/r/iiitiansnetwork" color="#ff4500" title="Reddit">
                <RedditIcon size={17} />
              </SocialIcon>
              <SocialIcon href="mailto:iiitiansnetwork@gmail.com" color="#6366f1" title="Email">
                <Mail size={17} />
              </SocialIcon>
              <SocialIcon href="https://iiitiansnetwork.com" color="#10b981" title="Website">
                <Globe size={17} />
              </SocialIcon>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "#ffffff" }}>Ecosystem</p>
            <ul className="space-y-2 text-[13px] font-medium text-slate-400">
              <li><Link href="/colleges" className="transition hover:text-white">IIIT Directory</Link></li>
              <li><Link href="/events" className="transition hover:text-white">Events Desk</Link></li>
              <li><Link href="/discuss" className="transition hover:text-white">Student Discuss</Link></li>
              <li><Link href="/opportunities" className="transition hover:text-white">Opportunities</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "#ffffff" }}>Community</p>
            <ul className="space-y-2 text-[13px] font-medium text-slate-400">
              <li><Link href="/merchandise" className="transition hover:text-white">Merchandise Store</Link></li>
              <li><Link href="/team" className="transition hover:text-white">Our Team</Link></li>
              <li><Link href="/legacy" className="transition hover:text-white">Network Legacy</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "#ffffff" }}>Resources</p>
            <ul className="space-y-2 text-[13px] font-medium text-slate-400">
              <li><Link href="/gallery" className="transition hover:text-white">Gallery</Link></li>
              <li><Link href="/guide" className="transition hover:text-white">Documentation</Link></li>
              <li><Link href="/guide" className="transition hover:text-white">Branding Kit</Link></li>
              <li><Link href="/sitemap" className="transition hover:text-white">Sitemap</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: "#ffffff" }}>Legal</p>
            <ul className="space-y-2 text-[13px] font-medium text-slate-400">
              <li><Link href="/" className="transition hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/" className="transition hover:text-white">Terms of Use</Link></li>
              <li><Link href="/" className="transition hover:text-white">Community Guidelines</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Contact Us</Link></li>
              <li><Link href="/admin" className="transition hover:text-white">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex flex-wrap gap-1.5 items-center text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wider">
            <span>Created by</span>
            <a href="https://www.linkedin.com/in/varun-raj-85592b324?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">Varun</a>
            <span className="text-slate-700 font-black">·</span>
            <a href="https://www.linkedin.com/in/yash-kapoor-a17026251?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">Yash</a>
            <span className="text-slate-700 font-black">·</span>
            <a href="https://ankurdev.vercel.app" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">Ankur</a>
            <span className="text-slate-700 font-black">·</span>
            <a href="https://linkedin.com/in/srishti-singh19/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">Srishti</a>
            <span className="text-slate-700 font-black">·</span>
            <a href="https://linkedin.com/in/utkarsh-pratap-460502251/" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">Utkarsh</a>
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
  <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#0b1329]/50 px-3 py-1.5 text-[13px] text-slate-200 sm:border sm:border-slate-800/80 sm:ring-1 sm:ring-white/5 sm:shadow-sm">
    <Icon size={14} className="text-indigo-400" />
    <span className="font-bold text-white">{value}</span>
    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
  </div>
);

const SocialIcon = ({
  href,
  color,
  title,
  children,
}: {
  href: string;
  color: string;
  title: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    title={title}
    style={{ color }}
    className="opacity-75 transition-all duration-200 hover:opacity-100 hover:scale-110 transform"
  >
    {children}
  </a>
);
