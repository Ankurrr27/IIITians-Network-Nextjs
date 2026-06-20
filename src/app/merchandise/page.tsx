"use client";

import React, { useState } from "react";
import useThemeMode from "@/hooks/useThemeMode";
import { ChevronRight, ArrowRight, Sparkles, X } from "lucide-react";

type MerchItem = {
  collegeName: string;
  initials: string;
  color: string;
  themeName: string;
};

// SVG Hoodie Mockup Component
function HoodieMockup({ color, initials }: { color: string; initials: string }) {
  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28 drop-shadow-lg transition-transform duration-500 group-hover:scale-105">
      {/* Sleeve Left */}
      <path d="M 22,85 C 14,70 12,48 20,40 C 26,45 30,55 30,70" fill={color} />
      <path d="M 22,85 C 14,70 12,48 20,40" stroke="#000" strokeWidth="1.5" strokeOpacity="0.08" fill="none" />
      
      {/* Sleeve Right */}
      <path d="M 78,85 C 86,70 88,48 80,40 C 74,45 70,55 70,70" fill={color} />
      <path d="M 78,85 C 86,70 88,48 80,40" stroke="#000" strokeWidth="1.5" strokeOpacity="0.08" fill="none" />

      {/* Hoodie Body */}
      <path d="M 26,85 C 26,50 30,42 50,42 C 70,42 74,50 74,85 Z" fill={color} />
      
      {/* Ribbed Bottom Hem */}
      <path d="M 26,85 L 74,85 L 74,88 L 26,88 Z" fill={color} opacity="0.8" />
      
      {/* Shadow overlay for depth */}
      <path d="M 26,85 C 26,50 30,42 50,42 C 70,42 74,50 74,85" stroke="#000" strokeWidth="2" strokeOpacity="0.06" fill="none" />

      {/* Hood Back */}
      <path d="M 33,42 C 30,22 38,15 50,15 C 62,15 70,22 67,42 Z" fill={color} opacity="0.9" />
      
      {/* Hood Opening/Lining */}
      <path d="M 38,42 C 38,26 42,20 50,20 C 58,20 62,26 62,42 C 62,44 50,46 50,46 C 50,46 38,44 38,42 Z" fill="#1e293b" opacity="0.3" />

      {/* Drawstrings */}
      <path d="M 47,42 L 47,56 C 47,58 45,58 45,56" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M 53,42 L 53,58 C 53,60 55,60 55,58" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Kangaroo Pocket */}
      <path d="M 36,85 L 64,85 L 60,72 L 40,72 Z" fill={color} opacity="0.85" stroke="#000" strokeWidth="1" strokeOpacity="0.1" />

      {/* Chest Logo Background */}
      <circle cx="50" cy="54" r="9" fill="#ffffff" opacity="0.15" />
      {/* Initials Text */}
      <text x="50" y="56.5" textAnchor="middle" fill="#ffffff" fontSize="7.5" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="0.5">
        {initials}
      </text>
    </svg>
  );
}

export default function MerchandisePage() {
  const { isDarkMode } = useThemeMode();
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(false);

  const collections: MerchItem[] = [
    { collegeName: "IIIT Ranchi", initials: "IIITR", color: "#4f46e5", themeName: "Indigo Classic" },
    { collegeName: "IIIT Hyderabad", initials: "IIITH", color: "#b91c1c", themeName: "Crimson Core" },
    { collegeName: "IIIT Allahabad", initials: "IIITA", color: "#0d9488", themeName: "Teal Heritage" },
    { collegeName: "IIIT Delhi", initials: "IIITD", color: "#0f172a", themeName: "Slate Premium" },
    { collegeName: "IIIT Lucknow", initials: "IIITL", color: "#7c3aed", themeName: "Violet Modern" },
    { collegeName: "Other IIITs", initials: "IIIT", color: "#0284c7", themeName: "Sky Network" },
  ];

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifySuccess(true);
  };

  return (
    <div className={`relative min-h-screen pb-16 pt-24 transition-colors duration-300 sm:pb-20 sm:pt-28 ${
      isDarkMode
        ? "bg-[linear-gradient(180deg,_#090d16_0%,_#0d1424_40%,_#0a0a0a_100%)] text-slate-100"
        : "bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)] text-slate-900"
    }`}>
      {/* Radial Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] backdrop-blur-md transition-colors duration-300 ${
            isDarkMode
              ? "border-indigo-900/30 bg-slate-900/80 text-indigo-400"
              : "border-indigo-100 bg-white/80 text-indigo-700 shadow-sm"
          }`}>
            <Sparkles className="h-4 w-4" />
            Official Gear
          </div>
          <h1 className={`mt-5 text-4xl font-extrabold tracking-tight sm:text-6xl ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            Represent Your IIIT.
          </h1>
          <p className={`mx-auto mt-4 max-w-2xl text-sm leading-relaxed sm:text-base ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
            Official merchandise collections for every IIIT are coming soon. Sign up below to get early access notifications and batch discount codes.
          </p>
        </div>

        {/* Merchandise Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((item) => (
            <div
              key={item.collegeName}
              className={`group flex flex-col justify-between rounded-[2.2rem] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isDarkMode
                  ? "border-slate-800 bg-slate-900/40 text-slate-100 hover:border-slate-700 hover:shadow-[0_20px_50px_rgba(99,102,241,0.05)]"
                  : "border-slate-200 bg-white text-slate-900 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.04)] shadow-sm"
              }`}
            >
              {/* Product Mockup Stage */}
              <div className={`relative flex items-center justify-center rounded-2xl py-8 mb-6 overflow-hidden ${
                isDarkMode ? "bg-slate-950/50" : "bg-slate-50"
              }`}>
                <HoodieMockup color={item.color} initials={item.initials} />
                <span className={`absolute bottom-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isDarkMode ? "bg-slate-900 text-slate-400" : "bg-white text-slate-500 shadow-sm"
                }`}>
                  {item.themeName}
                </span>
              </div>

              {/* Product Details */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-extrabold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    {item.collegeName}
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-900/30">
                    Edition
                  </span>
                </div>
                <p className={`mt-2 text-xs leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-500 font-semibold"}`}>
                  Premium hoodies, embroidered t-shirts, caps, and campus bundles featuring high-stitch logo details.
                </p>
              </div>

              {/* Action Area */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedCollege(item.collegeName);
                    setNotifySuccess(false);
                    setEmailInput("");
                    setShowNotifyModal(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-500/20"
                >
                  Notify Me
                  <ChevronRight size={14} />
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  Coming Soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notify Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl transition-colors duration-300 ${
            isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold tracking-tight">Merchandising Drops</h2>
              <button onClick={() => setShowNotifyModal(false)} className="text-slate-400 hover:text-slate-100">
                <X size={18} />
              </button>
            </div>

            {notifySuccess ? (
              <div className="text-center py-6">
                <span className="text-3xl">📧</span>
                <h3 className="text-sm font-bold mt-2">Added to Waitlist!</h3>
                <p className="text-xs text-slate-400 mt-1">We will notify you immediately when the {selectedCollege} merchandise goes live.</p>
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="space-y-4">
                <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600 font-medium"}`}>
                  Subscribe to receive an alert when the official waitlist for <span className="font-bold text-indigo-500">{selectedCollege}</span> opens up.
                </p>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@iiit.ac.in"
                    className={`mt-1 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? "bg-slate-950 border-slate-850 text-white" : "bg-slate-50 border-slate-200 text-slate-950"
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95"
                >
                  Join Waiting List
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
