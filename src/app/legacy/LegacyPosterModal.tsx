"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  Share2,
  X,
  Sparkles,
  Check,
  Quote,
  Briefcase,
  GraduationCap,
  Calendar,
  Building,
} from "lucide-react";
import { toPng } from "html-to-image";
import type { IAlumni } from "@/types";

interface LegacyPosterModalProps {
  entry: IAlumni;
  onClose: () => void;
  isDarkMode: boolean;
}

const POSTER_THEMES = [
  {
    id: "sunset-dream",
    name: "Sunset Dream",
    bgClass: "bg-gradient-to-tr from-rose-500 via-violet-600 to-indigo-600",
    cardClass: "bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.35)]",
    textClass: "text-white/80",
    nameClass: "text-white text-6xl font-black tracking-tight",
    badgeClass: "bg-white/20 text-white border border-white/30",
    roleClass: "text-rose-200 font-bold",
    quoteClass: "border-l-4 border-rose-400 bg-white/5 text-white/95",
    accentColor: "#f43f5e",
    dotClass: "bg-rose-400 ring-rose-400/40",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Glow",
    bgClass: "bg-neutral-950",
    cardClass: "bg-neutral-900/90 backdrop-blur-xl border border-pink-500/25 shadow-[0_0_50px_rgba(236,72,153,0.15)]",
    textClass: "text-neutral-400",
    nameClass: "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-400 to-cyan-400 text-6xl font-black tracking-tight",
    badgeClass: "bg-pink-500/10 text-pink-400 border border-pink-500/30",
    roleClass: "text-cyan-400 font-bold",
    quoteClass: "border-l-4 border-pink-500 bg-pink-950/20 text-zinc-200",
    accentColor: "#ec4899",
    dotClass: "bg-pink-500 ring-pink-500/30",
    decor: (
      <>
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-pink-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />
      </>
    )
  },
  {
    id: "obsidian-gold",
    name: "Obsidian Gold",
    bgClass: "bg-gradient-to-b from-stone-900 via-neutral-950 to-stone-950",
    cardClass: "bg-stone-900/70 backdrop-blur-2xl border border-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
    textClass: "text-stone-400",
    nameClass: "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-6xl font-black tracking-tight",
    badgeClass: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
    roleClass: "text-amber-400 font-bold",
    quoteClass: "border-l-4 border-amber-400 bg-amber-950/10 text-stone-200",
    accentColor: "#f59e0b",
    dotClass: "bg-amber-400 ring-amber-400/30",
    decor: (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)] pointer-events-none" />
    )
  },
  {
    id: "glass-frost",
    name: "Glass Frost",
    bgClass: "bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#311042]",
    cardClass: "bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shadow-2xl",
    textClass: "text-slate-300",
    nameClass: "text-white text-6xl font-black tracking-tight drop-shadow-sm",
    badgeClass: "bg-indigo-500/20 text-indigo-200 border border-indigo-400/30",
    roleClass: "text-indigo-300 font-bold",
    quoteClass: "border-l-4 border-indigo-400 bg-white/5 text-slate-200",
    accentColor: "#818cf8",
    dotClass: "bg-indigo-400 ring-indigo-400/30",
    decor: (
      <>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      </>
    )
  },
  {
    id: "aurora",
    name: "Aurora Forest",
    bgClass: "bg-gradient-to-tr from-emerald-900 via-teal-950 to-indigo-900",
    cardClass: "bg-emerald-950/40 backdrop-blur-xl border border-emerald-500/20 shadow-2xl",
    textClass: "text-emerald-200/80",
    nameClass: "text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-indigo-200 text-6xl font-black tracking-tight",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    roleClass: "text-emerald-300 font-bold",
    quoteClass: "border-l-4 border-emerald-400 bg-emerald-950/20 text-emerald-100",
    accentColor: "#34d399",
    dotClass: "bg-emerald-400 ring-emerald-400/30",
  }
];

const PRESET_TAGS = [
  "LEGACY MEMBER",
  "CORE TEAM",
  "COMMUNITY LEADER",
  "ALUMNI",
  "STUDENT LEAD",
  "COMMUNITY BUILDER"
];

export default function LegacyPosterModal({ entry, onClose, isDarkMode }: LegacyPosterModalProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = useState(POSTER_THEMES[0]);
  const [tagText, setTagText] = useState(entry.networkPost?.toUpperCase() || "LEGACY MEMBER");
  const [quoteText, setQuoteText] = useState(entry.bio || entry.contribution || "Building bridges across the IIIT ecosystem.");
  const [showQuote, setShowQuote] = useState(true);
  const [showJourney, setShowJourney] = useState(entry.roleHistory && entry.roleHistory.length > 0);
  const [showCurrentJob, setShowCurrentJob] = useState(!!entry.currentRole);
  const [isExporting, setIsExporting] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");
  const [isCustomTagActive, setIsCustomTagActive] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.35);

  // Auto-fit poster preview inside the viewport
  useEffect(() => {
    const handleResize = () => {
      const availableHeight = window.innerHeight - 180; // height minus controls/header padding
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
      // Small timeout to allow state modifications to settle fully
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
        // Fallback to clipboard if sharing files is not supported but clipboard is
        await handleDownload();
      }
    } catch (error) {
      console.error("Error sharing poster:", error);
      // Fallback to standard download on error
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div
        className={`relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border shadow-2xl md:flex-row ${
          isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        {/* Left Side: Mobile Poster Preview (Centered and Scaled) */}
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/90 p-6 md:p-10 relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
          <div 
            className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-400 backdrop-blur-md ring-1 ring-white/10"
          >
            <Sparkles className="h-3 w-3" /> Live Poster Preview
          </div>

          {/* Scale Container */}
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
              className={`relative flex h-[1920px] w-[1080px] flex-col justify-between p-16 select-none ${selectedTheme.bgClass}`}
            >
              {selectedTheme.decor}

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
                <div className={`rounded-full px-5 py-2 text-xs font-black tracking-widest uppercase ${selectedTheme.badgeClass}`}>
                  LEGACY REC
                </div>
              </div>

              {/* ── Poster Middle: Main Frosted Card ── */}
              <div className={`flex flex-col items-center p-12 text-center rounded-[3rem] z-10 ${selectedTheme.cardClass}`}>
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
                <h2 className={selectedTheme.nameClass}>{entry.name}</h2>
                
                <div className={`mt-4 inline-flex rounded-full px-5 py-1.5 text-sm font-extrabold uppercase tracking-widest ${selectedTheme.badgeClass}`}>
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
                  <div className={`mt-8 max-w-2xl rounded-2xl p-6 text-left ${selectedTheme.quoteClass}`}>
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
                          <span className={`absolute -left-[1.95rem] top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-neutral-900 ${selectedTheme.dotClass}`} />
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

        {/* Right Side: Customizer Panel */}
        <div className="flex h-full w-full md:w-96 flex-col overflow-y-auto p-6 md:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Poster Studio
              </h3>
              <p className="text-xs text-slate-500">Design your Instagram story poster</p>
            </div>
            <button
              onClick={onClose}
              className={`rounded-full p-2 transition ${
                isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex-1 space-y-6">
            {/* 1. Theme Palette */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Choose Poster Theme
              </label>
              <div className="grid grid-cols-5 gap-2.5">
                {POSTER_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    title={theme.name}
                    className={`group relative flex h-11 w-full items-center justify-center rounded-xl border transition ${
                      selectedTheme.id === theme.id
                        ? "border-indigo-500 scale-[1.05]"
                        : isDarkMode ? "border-slate-700 hover:border-slate-600" : "border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg ${theme.bgClass}`} />
                    {selectedTheme.id === theme.id && (
                      <span className="absolute flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white ring-2 ring-slate-900 text-[10px]">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500 text-center">{selectedTheme.name}</p>
            </div>

            {/* 2. Badge/Tag selector */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Role Tag Badge
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setIsCustomTagActive(false);
                      setTagText(tag);
                    }}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition ${
                      !isCustomTagActive && tagText === tag
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : isDarkMode
                          ? "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                <button
                  onClick={() => setIsCustomTagActive(true)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition ${
                    isCustomTagActive
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : isDarkMode
                        ? "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Custom...
                </button>
              </div>

              {isCustomTagActive && (
                <input
                  type="text"
                  placeholder="Enter custom badge text"
                  value={customTagInput}
                  maxLength={22}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomTagInput(val);
                    setTagText(val.toUpperCase() || "LEGACY MEMBER");
                  }}
                  className={`mt-2.5 w-full rounded-xl border px-3 py-2.5 text-xs outline-none transition ${
                    isDarkMode
                      ? "border-slate-800 bg-slate-950 text-slate-200 focus:border-indigo-500"
                      : "border-slate-200 bg-slate-50 text-slate-800 focus:border-indigo-500"
                  }`}
                />
              )}
            </div>

            {/* 3. Toggles */}
            <div className="space-y-4">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Visible Sections
              </label>

              <div className="flex flex-col gap-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className={`text-xs font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                    Show Legacy Quote Box
                  </span>
                  <input
                    type="checkbox"
                    checked={showQuote}
                    onChange={(e) => setShowQuote(e.target.checked)}
                    className="h-4.5 w-9 rounded-full bg-slate-200 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                {showQuote && (
                  <textarea
                    rows={3}
                    placeholder="Enter short poster bio/quote..."
                    value={quoteText}
                    maxLength={140}
                    onChange={(e) => setQuoteText(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs outline-none transition ${
                      isDarkMode
                        ? "border-slate-800 bg-slate-950 text-slate-200 focus:border-indigo-500"
                        : "border-slate-200 bg-slate-50 text-slate-800 focus:border-indigo-500"
                    }`}
                  />
                )}

                <label className="flex items-center justify-between cursor-pointer">
                  <span className={`text-xs font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                    Show Current Job/Role
                  </span>
                  <input
                    type="checkbox"
                    checked={showCurrentJob}
                    onChange={(e) => setShowCurrentJob(e.target.checked)}
                    disabled={!entry.currentRole}
                    className="disabled:opacity-50 h-4.5 w-9 rounded-full bg-slate-200 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className={`text-xs font-semibold ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                    Show Network Journey Timeline
                  </span>
                  <input
                    type="checkbox"
                    checked={showJourney}
                    onChange={(e) => setShowJourney(e.target.checked)}
                    disabled={!entry.roleHistory || entry.roleHistory.length === 0}
                    className="disabled:opacity-50 h-4.5 w-9 rounded-full bg-slate-200 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="ui-button ui-button-primary w-full py-3.5 text-xs font-bold inline-flex items-center justify-center gap-2 rounded-xl"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting Image..." : "Download Poster PNG"}
            </button>

            <button
              onClick={handleShare}
              disabled={isExporting}
              className={`w-full py-3.5 text-xs font-bold inline-flex items-center justify-center gap-2 rounded-xl border transition ${
                isDarkMode 
                  ? "border-slate-800 hover:bg-slate-800 text-slate-200" 
                  : "border-slate-200 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <Share2 className="h-4 w-4 text-indigo-500" />
              Share to Stories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
