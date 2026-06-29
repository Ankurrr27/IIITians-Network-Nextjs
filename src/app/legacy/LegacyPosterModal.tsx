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

  const currentJobLine = entry.name === "Hiteshwar Kaushik"
    ? "@Meesho"
    : entry.name === "Srishti Singh"
    ? "Google SWE Intern"
    : [entry.currentRole, entry.currentCompany].filter(Boolean).join(" @ ");

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
                ? "bg-slate-950"
                : "bg-slate-50"
            }`}
          >
            {/* Mesh Gradient / Ambient Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {/* Colored Orbs */}
              <div className="absolute -top-[200px] -left-[200px] h-[800px] w-[800px] rounded-full bg-indigo-600/30 blur-[120px]" />
              <div className="absolute top-[400px] -right-[300px] h-[900px] w-[900px] rounded-full bg-violet-600/20 blur-[140px]" />
              <div className="absolute -bottom-[300px] left-[100px] h-[1000px] w-[1000px] rounded-full bg-blue-600/20 blur-[150px]" />
              
              {/* Noise Overlay */}
              <div 
                className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
              />
            </div>
            
            {/* Logo — top left */}
            <div className="absolute top-16 left-16 z-20 flex items-center gap-6">
              <img
                src={isDarkMode ? "/IIITians-Network-Logo-Dark.png" : "/IIITians-Network-Logo-Blue.png"}
                alt="IIITians Network"
                crossOrigin="anonymous"
                className="h-28 w-auto object-contain drop-shadow-xl"
              />
              <div className="flex flex-col">
                <p className={`text-[2rem] font-black tracking-[0.2em] uppercase leading-none drop-shadow-md ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                  IIITians Network
                </p>
                <p className={`text-[1.3rem] font-bold tracking-[0.12em] mt-2 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                  EST. 2021
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-24 pt-[180px] pb-[100px] z-10 w-full h-full">

              {/* Image Avatar */}
              <div className="relative mb-14 flex items-center justify-center">
                {/* Dynamic Glow */}
                <div className="absolute inset-[-40px] rounded-full bg-gradient-to-tr from-indigo-500 via-violet-500 to-blue-500 opacity-40 blur-[40px] animate-pulse" />
                
                {/* Glassmorphism Ring */}
                <div className={`absolute inset-[-16px] rounded-full border-[4px] border-white/20 backdrop-blur-xl ${isDarkMode ? "bg-white/5" : "bg-white/30"}`} />
                
                <div className={`h-[420px] w-[420px] overflow-hidden rounded-full ring-[8px] relative z-10 ${
                  isDarkMode ? "ring-slate-800 bg-slate-900 shadow-[0_0_80px_rgba(79,70,229,0.3)]" : "ring-white bg-white shadow-[0_0_80px_rgba(79,70,229,0.2)]"
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
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-[10rem] font-black text-white">
                      {entry.name[0]}
                    </div>
                  )}
                </div>
                
                {/* Floating Role Icon */}
                <div className={`absolute bottom-4 right-4 z-20 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 ring-[12px] shadow-2xl backdrop-blur-md ${
                  isDarkMode ? "ring-slate-900 border border-white/10" : "ring-slate-50 border border-white/20"
                }`}>
                  <Sparkles className="h-14 w-14 text-white" />
                </div>
              </div>

              {/* Name */}
              <h2 className={`text-[6.5rem] font-black tracking-tight mb-8 text-center leading-[1.1] ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                {entry.name}
              </h2>

              {/* Role Badge (Glassmorphism Pill) */}
              <div className="flex items-center justify-center mb-8">
                <div className={`flex items-center gap-6 rounded-full px-12 py-5 shadow-2xl backdrop-blur-md border border-white/20 ${
                  isDarkMode ? "bg-white/10 shadow-indigo-500/20" : "bg-white/60 shadow-indigo-500/10"
                }`}>
                  <Sparkles className={`h-8 w-8 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                  <span className={`text-[2rem] font-black tracking-[0.25em] uppercase ${
                    isDarkMode ? "text-white" : "text-indigo-900"
                  }`}>
                    {tagText}
                  </span>
                  <Sparkles className={`h-8 w-8 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                </div>
              </div>

              {/* Service Line */}
              <p className={`text-[2.4rem] font-extrabold tracking-wide mb-4 text-center ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                {serviceLine}
              </p>

              {/* Current Job */}
              {showCurrentJob && currentJobLine && (
                <div className={`flex items-center gap-5 text-[2rem] font-bold mb-10 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  <Briefcase className={`h-10 w-10 shrink-0 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
                  <span>{currentJobLine}</span>
                </div>
              )}

              {/* Quote Box (Glassmorphism) */}
              {showQuote && quoteText && (
                <div className={`relative mt-12 mb-12 w-full rounded-[2.5rem] px-16 py-16 backdrop-blur-xl border border-white/20 shadow-2xl ${
                  isDarkMode ? "bg-white/5 shadow-black/50" : "bg-white/40 shadow-indigo-900/5"
                }`}>
                  <Quote className={`absolute -top-12 left-12 h-24 w-24 rounded-full p-5 rotate-180 text-white bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl border-4 ${isDarkMode ? "border-slate-900" : "border-slate-50"}`} />
                  <p className={`text-[2.2rem] font-semibold leading-[1.6] italic text-center ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>
                    "{quoteText}"
                  </p>
                </div>
              )}

              {/* Network Journey */}
              {showJourney && entry.roleHistory && entry.roleHistory.length > 0 && (
                <div className="w-full mt-4">
                  <div className="flex items-center gap-8 mb-12">
                    <div className={`h-[3px] flex-1 rounded-full ${isDarkMode ? "bg-indigo-500/30" : "bg-indigo-600/20"}`} />
                    <span className={`text-[1.8rem] font-black uppercase tracking-[0.35em] ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}>
                      Network Journey
                    </span>
                    <div className={`h-[3px] flex-1 rounded-full ${isDarkMode ? "bg-indigo-500/30" : "bg-indigo-600/20"}`} />
                  </div>

                  <div className="relative space-y-14 pl-[6rem]">
                    <div className={`absolute bottom-4 left-[2.2rem] top-4 w-[4px] rounded-full ${isDarkMode ? "bg-indigo-500/30" : "bg-indigo-600/20"}`} />
                    {entry.roleHistory.slice(0, 3).map((item, index) => (
                      <div key={index} className="relative">
                        <div className={`absolute -left-[6rem] top-0 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 ring-[8px] shadow-xl z-10 ${isDarkMode ? "ring-slate-900" : "ring-slate-50"}`}>
                          {getRoleIcon(item.role)}
                        </div>
                        <p className={`text-[2.2rem] font-black mb-2 uppercase tracking-wide ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                          {item.role || "Legacy Member"}
                        </p>
                        <p className={`text-[1.7rem] font-bold tracking-wide ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {[item.team, item.year].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom-right: tagline & QR placeholder */}
            <div className="absolute bottom-16 right-16 z-20 flex items-center gap-8">
              <div className="text-right">
                <p className={`text-[2rem] font-black italic tracking-wide ${
                  isDarkMode ? "text-white/60" : "text-slate-900/50"
                }`}>
                  A never-ending connection...
                </p>
                <p className={`text-[1.3rem] font-bold tracking-[0.25em] uppercase mt-2 ${
                  isDarkMode ? "text-indigo-400/80" : "text-indigo-600/80"
                }`}>
                  iiitiansnetwork.in/legacy
                </p>
              </div>
              <div className={`h-24 w-24 rounded-2xl backdrop-blur-md border border-white/20 p-2 shadow-xl ${
                isDarkMode ? "bg-white/10" : "bg-white/60"
              }`}>
                {/* We use a simple CSS pattern for the QR code representation */}
                <div className={`h-full w-full rounded-lg opacity-80 ${isDarkMode ? "bg-white" : "bg-slate-900"}`} style={{
                  backgroundImage: `linear-gradient(45deg, ${isDarkMode ? "#000" : "#fff"} 25%, transparent 25%, transparent 75%, ${isDarkMode ? "#000" : "#fff"} 75%, ${isDarkMode ? "#000" : "#fff"}), linear-gradient(45deg, ${isDarkMode ? "#000" : "#fff"} 25%, transparent 25%, transparent 75%, ${isDarkMode ? "#000" : "#fff"} 75%, ${isDarkMode ? "#000" : "#fff"})`,
                  backgroundSize: `16px 16px`,
                  backgroundPosition: `0 0, 8px 8px`
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
