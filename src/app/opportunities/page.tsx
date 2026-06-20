"use client";

import React, { useState } from "react";
import { Briefcase, GraduationCap, Github, Trophy, Search, MapPin, Plus, ExternalLink, Calendar } from "lucide-react";
import useThemeMode from "@/hooks/useThemeMode";

type Opportunity = {
  title: string;
  provider: string;
  location: string;
  details: string;
  link: string;
  category: "Internships" | "Research" | "Open Source" | "Hackathons";
  posted: string;
};

export default function OpportunitiesPage() {
  const { isDarkMode } = useThemeMode();
  const [activeTab, setActiveTab] = useState<"All" | "Internships" | "Research" | "Open Source" | "Hackathons">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const initialOpportunities: Opportunity[] = [
    { title: "Frontend Engineering Intern", provider: "Fintech Startup (Alumni Led)", location: "Remote / Bengaluru", details: "Build reactive dashboards using Next.js, Tailwind CSS, and state management. Work directly under a Senior Architect (IIIT Gwalior alumnus).", link: "mailto:iiitiansnetwork@gmail.com?subject=Apply: Frontend Intern", category: "Internships", posted: "1 day ago" },
    { title: "Product Design Intern", provider: "IIITians Network Web Team", location: "Remote", details: "Iterate on user flows, design official merchandising mockups, and run accessibility compliance checks for the centralized network portal.", link: "mailto:iiitiansnetwork@gmail.com?subject=Apply: Product Design", category: "Internships", posted: "3 days ago" },
    { title: "Software Engineer Intern", provider: "Cloud Scale Tech", location: "Pune / Hybrid", details: "Collaborate on building scalable APIs, optimizing database queries, and integrating Cloudflare CDN caches.", link: "mailto:iiitiansnetwork@gmail.com?subject=Apply: SE Intern", category: "Internships", posted: "1 week ago" },
    { title: "Machine Learning Research Assistant", provider: "AI Lab, IIIT Delhi", location: "New Delhi / Hybrid", details: "Work on computer vision and multimodal model alignment. Ideal for third/fourth-year undergraduate students aiming for research papers.", link: "mailto:iiitiansnetwork@gmail.com?subject=Research: ML Assistant", category: "Research", posted: "2 days ago" },
    { title: "Natural Language Processing Intern", provider: "LTRC, IIIT Hyderabad", location: "Hyderabad", details: "Contribute to Indian language translation models. Requires proficiency in Python and deep learning frameworks.", link: "mailto:iiitiansnetwork@gmail.com?subject=Research: NLP Intern", category: "Research", posted: "4 days ago" },
    { title: "Research Fellow - Cryptography", provider: "IIIT Allahabad Labs", location: "Allahabad / Remote", details: "Investigate zero-knowledge proofs and secure multi-party computations. Background in abstract algebra and complexity theory required.", link: "mailto:iiitiansnetwork@gmail.com?subject=Research: Cryptography Fellow", category: "Research", posted: "2 weeks ago" },
    { title: "Next.js Central Portal Contribution", provider: "IIITians Network", location: "GitHub", details: "Help optimize placement search index filters, build the merchandise store grid, and resolve responsiveness bug tickets.", link: "https://github.com/Ankurrr27/IIITians-Network-Nextjs", category: "Open Source", posted: "5 days ago" },
    { title: "Discuss Forums Auth Integration", provider: "Student Discuss Team", location: "GitHub", details: "Implement secure OAuth flows for official club manager profiles using NextAuth and MongoDB adapter patterns.", link: "https://github.com/Ankurrr27/IIITians-Network-Nextjs", category: "Open Source", posted: "1 week ago" },
    { title: "Inter-IIIT Hackathon 2026", provider: "IIITians Network Community", location: "Online / Hybrid", details: "24-hour development sprint bringing teams from all 25+ IIITs to solve structural challenges in education, tech, and college outreach.", link: "mailto:iiitiansnetwork@gmail.com?subject=Hackathon Register", category: "Hackathons", posted: "Just now" },
    { title: "Smart India Hackathon Prep-Sprint", provider: "Coding Clubs Joint Alliance", location: "Host Campuses", details: "A preparatory mock hackathon featuring review panels of senior alumni who previously won SIH to critique problem statements.", link: "mailto:iiitiansnetwork@gmail.com?subject=Hackathon Prep Sprint", category: "Hackathons", posted: "3 days ago" },
  ];

  const filtered = initialOpportunities.filter((opp) => {
    const matchesTab = activeTab === "All" || opp.category === activeTab;
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const categories = [
    { name: "All", icon: Briefcase },
    { name: "Internships", icon: Briefcase },
    { name: "Research", icon: GraduationCap },
    { name: "Open Source", icon: Github },
    { name: "Hackathons", icon: Trophy },
  ] as const;

  return (
    <div className={`relative min-h-screen pb-16 pt-24 transition-colors duration-300 sm:pb-20 sm:pt-28 ${
      isDarkMode
        ? "bg-[linear-gradient(180deg,_#090d16_0%,_#0d1424_40%,_#0a0a0a_100%)] text-slate-100"
        : "bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)] text-slate-900"
    }`}>
      {/* Radial Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] backdrop-blur-md transition-colors duration-300 ${
              isDarkMode
                ? "border-indigo-900/30 bg-slate-900/80 text-indigo-400"
                : "border-indigo-100 bg-white/80 text-indigo-700"
            }`}>
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Opportunities Hub
            </div>
            <h1 className={`mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Shared Opportunities
            </h1>
            <p className={`mt-3 max-w-2xl text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
              Find internships, research fellowships, hackathons, and open source opportunities posted directly by students, alumni, and partners across the IIIT network.
            </p>
          </div>

          <button
            onClick={() => { setShowSubmitModal(true); setSubmitSuccess(false); }}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95 self-start md:self-auto"
          >
            <Plus size={16} />
            Post Opportunity
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid gap-4 sm:flex sm:items-center sm:justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow shadow-indigo-500/20"
                      : isDarkMode
                      ? "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative flex items-center w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search postings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl border py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500"
                  : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
              }`}
            />
          </div>
        </div>

        {/* Grid List */}
        {filtered.length === 0 ? (
          <div className={`text-center py-12 rounded-3xl border ${isDarkMode ? "border-slate-800 bg-slate-900/10" : "border-slate-200 bg-white/50"}`}>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500 font-semibold"}`}>No opportunities found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {filtered.map((opp, index) => (
              <div
                key={index}
                className={`flex flex-col justify-between rounded-3xl border p-6 shadow-sm transition hover:shadow-md hover:-translate-y-0.5 duration-200 ${
                  isDarkMode
                    ? "border-slate-800 bg-slate-900/40 text-slate-100 hover:border-slate-700"
                    : "border-slate-200 bg-white text-slate-900 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.04)]"
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                      {opp.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                      <MapPin size={10} />
                      {opp.location}
                    </span>
                    <span className="ml-auto text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar size={10} />
                      {opp.posted}
                    </span>
                  </div>
                  <h3 className={`mt-4 text-base font-extrabold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>{opp.title}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mt-0.5">{opp.provider}</p>
                  <p className={`mt-3.5 text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600 font-medium"}`}>
                    {opp.details}
                  </p>
                </div>

                <div className={`mt-6 border-t pt-4 flex justify-end ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
                  <a
                    href={opp.link}
                    target={opp.link.startsWith("http") ? "_blank" : undefined}
                    rel={opp.link.startsWith("http") ? "noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                  >
                    Apply / Learn More
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl transition-colors duration-300 ${
            isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950"
          }`}>
            <h2 className="text-xl font-bold tracking-tight">Post an Opportunity</h2>
            <p className="text-xs text-slate-400 mt-1">Submit internships, open source projects, or hackathons to the community.</p>

            {submitSuccess ? (
              <div className="mt-6 text-center py-6">
                <span className="text-3xl">🎉</span>
                <h3 className="text-sm font-bold mt-2">Opportunity Submitted!</h3>
                <p className="text-xs text-slate-400 mt-1">Our coordinators will verify and post the listing shortly.</p>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitSuccess(true);
                }}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Opportunity Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frontend Engineering Intern"
                    className={`mt-1 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? "bg-slate-950 border-slate-850 text-white" : "bg-slate-50 border-slate-200 text-slate-950"
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                    <select
                      className={`mt-1 w-full rounded-xl border p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? "bg-slate-950 border-slate-850 text-white" : "bg-slate-50 border-slate-200 text-slate-950"
                      }`}
                    >
                      <option>Internships</option>
                      <option>Research</option>
                      <option>Open Source</option>
                      <option>Hackathons</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Remote / Pune"
                      className={`mt-1 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDarkMode ? "bg-slate-950 border-slate-850 text-white" : "bg-slate-50 border-slate-200 text-slate-950"
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Company / Lab Provider</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Lab, IIIT Delhi"
                    className={`mt-1 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? "bg-slate-950 border-slate-850 text-white" : "bg-slate-50 border-slate-200 text-slate-950"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Description & Details</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide details about requirements, roles, or how to apply..."
                    className={`mt-1 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode ? "bg-slate-950 border-slate-850 text-white" : "bg-slate-50 border-slate-200 text-slate-950"
                    }`}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition hover:bg-slate-50/5 active:scale-95 ${
                      isDarkMode ? "border-slate-800 text-slate-300" : "border-slate-200 text-slate-700"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95"
                  >
                    Submit Opportunity
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
