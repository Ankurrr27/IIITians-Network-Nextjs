"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  Share2,
  X,
  Sparkles,
  Quote,
  Briefcase,
} from "lucide-react";
import { toPng } from "html-to-image";
import type { IAlumni } from "@/types";

interface LegacyPosterModalProps {
  entry: IAlumni;
  onClose: () => void;
  isDarkMode: boolean;
}

const appTheme = {
  id: "app-theme",
  bgClass: "bg-indigo-950",
  cardClass: "bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl",
  textClass: "text-white/80",
  nameClass: "text-white text-6xl font-black tracking-tight",
  badgeClass: "bg-indigo-600 text-white border border-indigo-500",
  roleClass: "text-indigo-300 font-bold",
  quoteClass: "border-l-4 border-indigo-400 bg-white/5 text-white/95",
  accentColor: "#4f46e5",
  dotClass: "bg-indigo-400 ring-indigo-400/40",
  decor: (
    <>
      <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-violet-500/20 blur-[120px] pointer-events-none" />
    </>
  )
};

export default function LegacyPosterModal({ entry, onClose }: LegacyPosterModalProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.35);

  const tagText = entry.networkPost?.toUpperCase() || "LEGACY MEMBER";
  const quoteText = entry.bio || entry.contribution || "Building bridges across the IIIT ecosystem.";
  const showQuote = !!quoteText;
  const showJourney = entry.roleHistory && entry.roleHistory.length > 0;
  const showCurrentJob = !!entry.currentRole;

  // Auto-fit poster preview inside the viewport
  useEffect(() => {
    const handleResize = () => {
      const availableHeight = window.innerHeight - 100; // height minus controls padding
      const scale = Math.min(Math.max(availableHeight / 1920, 0.15), 0.45);
      setPreviewScale(scale);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDownload = async () => {
    if (!posterRef.current || isExporting) return;
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(posterRef.current, {
        width: 1080,
        height: 1920,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `${entry.name.toLowerCase().replace(/\s+/g, "-")}-legacy-poster.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Could not export poster image:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!posterRef.current || isExporting) return;
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(posterRef.current, {
        width: 1080,
        height: 1920,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
        cacheBust: true,
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "legacy-poster.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${entry.name} Legacy Profile`,
          text: `Check out my legacy profile on IIITians Network!`,
        });
      } else {
        await handleDownload();
      }
    } catch (error) {
      console.error("Error sharing poster:", error);
      await handleDownload();
    } finally {
      setIsExporting(false);
    }
  };

  const serviceLine = entry.graduationYear 
    ? `${entry.iiit} · Class of ${entry.graduationYear}`
    : `${entry.iiit} · ${entry.generation || "Legacy Member"}`;

  const currentJobLine = [entry.currentRole, entry.currentCompany].filter(Boolean).join(" @ ");

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/95 p-4 backdrop-blur-md">
      {/* Top Action Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 z-50">
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Download"}</span>
          </button>
          <button
            onClick={handleShare}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scaled Poster Preview */}
      <div className="relative flex-1 flex flex-col items-center justify-center w-full overflow-hidden">
        <div 
          className="relative transition-all duration-300"
          style={{ 
            width: "1080px", 
            height: "1920px", 
            transform: `scale(${previewScale})`,
            transformOrigin: "center center",
            margin: `calc(-960px * (1 - ${previewScale})) calc(-540px * (1 - ${previewScale}))`
          }}
        >
          {/* The Actual Poster (Fixed 1080x1920 dimensions) */}
          <div
            ref={posterRef}
            id="legacy-instagram-poster"
            className={`relative flex h-[1920px] w-[1080px] flex-col justify-between p-16 select-none ${appTheme.bgClass}`}
          >
            {appTheme.decor}

            {/* ── Poster Top: Header ── */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-md">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-[0.25em] text-white">
                    IIITians Network
                  </h4>
                  <p className="text-xs font-semibold tracking-[0.3em] text-white/60">
                    EST. 2021
                  </p>
                </div>
              </div>
              <div className={`rounded-full px-5 py-2 text-xs font-black tracking-widest uppercase ${appTheme.badgeClass}`}>
                LEGACY REC
              </div>
            </div>

            {/* ── Poster Middle: Main Frosted Card ── */}
            <div className={`flex flex-col items-center p-12 text-center rounded-[3rem] z-10 ${appTheme.cardClass}`}>
              {/* Profile Photo */}
              <div className="relative mb-8 h-60 w-60 overflow-hidden rounded-full ring-8 ring-white/10">
                {entry.photo?.url ? (
                  <img
                    src={entry.photo.url}
                    alt={entry.name}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 text-8xl font-black text-indigo-600">
                    {entry.name[0]}
                  </div>
                )}
                <div className="absolute inset-0 ring-4 ring-inset ring-white/20 rounded-full" />
              </div>

              {/* Name & Title */}
              <h2 className={appTheme.nameClass}>{entry.name}</h2>
              
              <div className={`mt-4 inline-flex rounded-full px-5 py-1.5 text-sm font-extrabold uppercase tracking-widest ${appTheme.badgeClass}`}>
                {tagText}
              </div>

              <p className="mt-6 text-xl font-bold text-white tracking-wide">{serviceLine}</p>

              {showCurrentJob && currentJobLine && (
                <div className="mt-3 flex items-center justify-center gap-2 text-base text-white/70">
                  <Briefcase className="h-4 w-4 shrink-0 text-white/50" />
                  <span>{currentJobLine}</span>
                </div>
              )}

              {/* Legacy Message / Quote */}
              {showQuote && quoteText && (
                <div className={`mt-8 max-w-2xl rounded-2xl p-6 text-left ${appTheme.quoteClass}`}>
                  <Quote className="h-8 w-8 text-white/30 mb-2 rotate-180" />
                  <p className="text-xl font-medium leading-relaxed italic">
                    "{quoteText}"
                  </p>
                </div>
              )}

              {/* Journey Timeline */}
              {showJourney && entry.roleHistory && entry.roleHistory.length > 0 && (
                <div className="mt-10 w-full text-left">
                  <div className="flex items-center gap-4 mb-5">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Network Journey</span>
                    <div className="h-px flex-1 bg-white/15" />
                  </div>
                  <div className="relative space-y-5 pl-8">
                    <div className="absolute bottom-2 left-[0.4rem] top-2 w-0.5 bg-white/10" />
                    {entry.roleHistory.slice(0, 3).map((item, index) => (
                      <div key={index} className="relative">
                        <span className={`absolute -left-[1.95rem] top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-neutral-900 ${appTheme.dotClass}`} />
                        <p className="text-base font-black text-white leading-snug">
                          {item.role || "Legacy Member"}
                        </p>
                        <p className="text-sm text-white/50 font-medium">
                          {[item.team, item.year].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Poster Bottom: Footer Card ── */}
            <div className={`flex items-center justify-between p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md z-10`}>
              <div className="text-left">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  Profile Verification
                </p>
                <p className="mt-1 text-sm font-semibold text-white/95">
                  iiitiansnetwork.com/legacy
                </p>
                <p className="mt-2 text-[10px] font-medium text-white/30">
                  Legacy ID: IIN-LEGACY-{entry._id.slice(-6).toUpperCase()}
                </p>
              </div>
              {/* Stylized Mock QR Code */}
              <div className="h-20 w-20 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 100 100" className="h-full w-full text-indigo-950" fill="currentColor">
                  {/* Corners */}
                  <path d="M 0 0 h 30 v 10 h -20 v 20 h -10 Z" />
                  <path d="M 5 5 h 20 v 20 h -20 Z" fill="none" stroke="currentColor" strokeWidth="5" />
                  <path d="M 70 0 h 30 v 30 h -10 v -20 h -20 Z" />
                  <path d="M 75 5 h 20 v 20 h -20 Z" fill="none" stroke="currentColor" strokeWidth="5" />
                  <path d="M 0 70 h 10 v 20 h 20 v 10 h -30 Z" />
                  <path d="M 5 75 h 20 v 20 h -20 Z" fill="none" stroke="currentColor" strokeWidth="5" />
                  {/* Mock QR modules */}
                  <rect x="40" y="10" width="10" height="10" />
                  <rect x="50" y="20" width="10" height="10" />
                  <rect x="40" y="40" width="20" height="20" />
                  <rect x="10" y="40" width="10" height="10" />
                  <rect x="20" y="50" width="10" height="10" />
                  <rect x="80" y="40" width="10" height="10" />
                  <rect x="70" y="50" width="10" height="10" />
                  <rect x="40" y="70" width="10" height="10" />
                  <rect x="50" y="80" width="10" height="10" />
                  <rect x="80" y="80" width="15" height="15" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
