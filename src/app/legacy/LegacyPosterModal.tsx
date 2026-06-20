"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  Share2,
  X,
  Sparkles,
  Quote,
  Briefcase,
  Shield,
  Code,
  Palette,
  MessageCircle,
  Star,
  Trophy,
} from "lucide-react";
import { toPng } from "html-to-image";
import type { IAlumni } from "@/types";

interface LegacyPosterModalProps {
  entry: IAlumni;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function LegacyPosterModal({ entry, onClose, isDarkMode }: LegacyPosterModalProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.35);

  const tagText = entry.networkPost?.toUpperCase() || "LEGACY MEMBER";
  const quoteText = entry.bio || entry.contribution || "Building bridges across the IIIT ecosystem.";
  const showQuote = !!quoteText;
  const showJourney = entry.roleHistory && entry.roleHistory.length > 0;
  const showCurrentJob = !!entry.currentRole;

  const getRoleIcon = (roleName?: string) => {
    if (!roleName) return <Star className="h-6 w-6 text-white" strokeWidth={2.5} />;
    const r = roleName.toLowerCase();
    if (r.includes('president')) return <Trophy className="h-6 w-6 text-white" strokeWidth={2.5} />;
    if (r.includes('social') || r.includes('media') || r.includes('instagram') || r.includes('pr ')) return <MessageCircle className="h-6 w-6 text-white" strokeWidth={2.5} />;
    if (r.includes('dev') || r.includes('tech') || r.includes('app') || r.includes('web')) return <Code className="h-6 w-6 text-white" strokeWidth={2.5} />;
    if (r.includes('design') || r.includes('video') || r.includes('edit')) return <Palette className="h-6 w-6 text-white" strokeWidth={2.5} />;
    if (r.includes('admin') || r.includes('manage') || r.includes('lead')) return <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />;
    return <Briefcase className="h-6 w-6 text-white" strokeWidth={2.5} />;
  };

  // Auto-fit poster preview inside the viewport
  useEffect(() => {
    const handleResize = () => {
      const availableHeight = window.innerHeight - 100;
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
    ? `${entry.iiit} · Team of ${entry.graduationYear}`
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
          {/* THE POSTER */}
          <div
            ref={posterRef}
            id="legacy-instagram-poster"
            className={`relative flex h-[1920px] w-[1080px] flex-col items-center justify-center select-none overflow-hidden ${
              isDarkMode
                ? "bg-[linear-gradient(180deg,_#0a0a1a_0%,_#0d0d2b_100%)]"
                : "bg-[linear-gradient(180deg,_#eef2ff_0%,_#f5f3ff_100%)]"
            }`}
          >
            {/* Top Wave */}
            <div className="absolute top-0 left-0 w-full leading-[0] pointer-events-none z-0">
              <svg className="relative block w-full h-[320px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 320" preserveAspectRatio="none">
                <path d="M0,0V120C120,180,240,220,360,200C480,180,540,120,660,100C780,80,900,120,1080,160V0Z" opacity={isDarkMode ? "0.35" : "0.15"} fill="#4f46e5" />
                <path d="M0,0V80C100,140,220,180,360,160C500,140,580,80,720,60C860,40,980,100,1080,120V0Z" opacity={isDarkMode ? "0.55" : "0.3"} fill="#4f46e5" />
                <path d="M0,0V40C80,80,200,120,340,110C480,100,580,50,720,30C860,10,980,60,1080,80V0Z" fill="#4f46e5" />
              </svg>
            </div>

            {/* Bottom Wave (flipped) */}
            <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none z-0 rotate-180">
              <svg className="relative block w-full h-[220px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 220" preserveAspectRatio="none">
                <path d="M0,0V60C120,110,280,140,440,120C600,100,700,50,860,40C980,30,1060,60,1080,80V0Z" opacity={isDarkMode ? "0.3" : "0.12"} fill="#4f46e5" />
                <path d="M0,0V30C100,70,240,100,400,90C560,80,680,40,840,20C960,5,1040,30,1080,50V0Z" opacity={isDarkMode ? "0.5" : "0.25"} fill="#4f46e5" />
                <path d="M0,0V10C80,40,200,70,360,60C520,50,640,20,800,10C920,2,1020,20,1080,30V0Z" fill="#4f46e5" opacity={isDarkMode ? "0.7" : "0.5"} />
              </svg>
            </div>
            
            {/* Logo — top left over the wave */}
            <div className="absolute top-12 left-14 z-20 flex items-center gap-6">
              <img
                src="/iiitians-logo.png"
                alt="IIITians Network"
                crossOrigin="anonymous"
                className="h-28 w-28 object-contain drop-shadow-lg"
              />
              <div>
                <p className="text-[2rem] font-black tracking-[0.2em] text-white uppercase leading-none drop-shadow">
                  IIITians Network
                </p>
                <p className="text-[1.3rem] font-semibold tracking-[0.12em] text-white/70 mt-1">
                  EST. 2021
                </p>
              </div>
            </div>

            {/* Main Content — fits inside waves top(~260px) and bottom(~180px) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-20 pt-[260px] pb-[220px] z-10">

              {/* Image Avatar */}
              <div className="relative mb-10 flex items-center justify-center">
                <div className="absolute inset-[-8px] rounded-full bg-gradient-to-tr from-[#4f46e5] via-[#6366f1] to-[#818cf8] opacity-90" />
                <div className={`h-[360px] w-[360px] overflow-hidden rounded-full ring-[14px] relative z-10 ${
                  isDarkMode ? "ring-[#0a0a1a] bg-[#0a0a1a] shadow-[0_30px_80px_rgba(0,0,0,0.6)]" : "ring-white bg-white shadow-[0_40px_80px_rgba(79,70,229,0.25)]"
                }`}>
                  {entry.photo?.url ? (
                    <img
                      src={entry.photo.url}
                      alt={entry.name}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-[8rem] font-black text-white">
                      {entry.name[0]}
                    </div>
                  )}
                </div>
                <div className={`absolute bottom-2 right-2 z-20 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#4338ca] ring-[10px] shadow-2xl ${
                  isDarkMode ? "ring-[#0a0a1a]" : "ring-white"
                }`}>
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* Name */}
              <h2 className={`text-[5.5rem] font-black tracking-tight mb-6 text-center leading-none ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                {entry.name}
              </h2>

              {/* Role Badge */}
              <div className="flex items-center gap-6 mb-6">
                <Sparkles className="h-9 w-9 text-[#6366f1]" />
                <div className="rounded-full bg-gradient-to-r from-[#4f46e5] to-[#4338ca] px-12 py-4 text-[2rem] font-black tracking-widest text-white uppercase shadow-xl shadow-indigo-500/30">
                  {tagText}
                </div>
                <Sparkles className="h-9 w-9 text-[#6366f1]" />
              </div>

              {/* Service Line */}
              <p className={`text-[2.2rem] font-extrabold tracking-wide mb-3 text-center ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                {serviceLine}
              </p>

              {/* Current Job */}
              {showCurrentJob && currentJobLine && (
                <div className={`flex items-center gap-4 text-[1.8rem] font-bold mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  <Briefcase className={`h-9 w-9 shrink-0 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                  <span>{currentJobLine}</span>
                </div>
              )}

              {/* Quote Box */}
              {showQuote && quoteText && (
                <div className={`relative mt-8 mb-10 w-full rounded-[1.8rem] px-14 py-14 border-2 ${
                  isDarkMode ? "bg-[#0d0d2b]/80 border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]" : "bg-white border-[#e0e7ff]/60 shadow-[0_20px_50px_rgba(79,70,229,0.07)]"
                }`}>
                  <Quote className={`absolute -top-9 left-10 h-20 w-20 text-[#4f46e5] rounded-full rotate-180 ${isDarkMode ? "bg-[#0a0a1a]" : "bg-white"}`} />
                  <p className={`text-[1.9rem] font-semibold leading-[1.65] italic text-center ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    "{quoteText}"
                  </p>
                </div>
              )}

              {/* Network Journey */}
              {showJourney && entry.roleHistory && entry.roleHistory.length > 0 && (
                <div className="w-full mt-2">
                  <div className="flex items-center gap-6 mb-10">
                    <div className={`h-[2px] flex-1 ${isDarkMode ? "bg-[#4f46e5]/20" : "bg-[#e0e7ff]"}`} />
                    <span className={`text-[1.7rem] font-black uppercase tracking-[0.3em] ${isDarkMode ? "text-[#818cf8]" : "text-[#4f46e5]"}`}>
                      Network Journey
                    </span>
                    <div className={`h-[2px] flex-1 ${isDarkMode ? "bg-[#4f46e5]/20" : "bg-[#e0e7ff]"}`} />
                  </div>

                  <div className="relative space-y-12 pl-[5rem]">
                    <div className={`absolute bottom-4 left-[1.7rem] top-4 w-[3px] rounded-full ${isDarkMode ? "bg-[#4f46e5]/20" : "bg-[#e0e7ff]"}`} />
                    {entry.roleHistory.slice(0, 3).map((item, index) => (
                      <div key={index} className="relative">
                        <div className={`absolute -left-[5rem] top-1 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#4338ca] ring-[8px] shadow-lg z-10 ${isDarkMode ? "ring-[#0a0a1a]" : "ring-[#eef2ff]"}`}>
                          {getRoleIcon(item.role)}
                        </div>
                        <p className={`text-[2rem] font-black mb-1 uppercase tracking-wide ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                          {item.role || "Legacy Member"}
                        </p>
                        <p className={`text-[1.5rem] font-bold tracking-wide ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {[item.team, item.year].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom-right: tagline */}
            <div className="absolute bottom-[4rem] right-[4rem] z-20 text-right">
              <p className={`text-[1.8rem] font-bold italic tracking-wide ${
                isDarkMode ? "text-white/40" : "text-[#4f46e5]/55"
              }`}>
                A never-ending connection...
              </p>
              <p className={`text-[1.2rem] font-semibold tracking-[0.18em] uppercase mt-1 ${
                isDarkMode ? "text-white/25" : "text-[#4f46e5]/40"
              }`}>
                iiitiansnetwork.com/legacy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
