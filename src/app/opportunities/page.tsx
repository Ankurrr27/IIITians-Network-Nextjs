"use client";

import React, { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import useThemeMode from "@/hooks/useThemeMode";
import { CATEGORY_ALL } from "@/data/opportunities";
import type { OpportunityCategory } from "@/data/opportunities";
import api from "@/lib/apiClient";

import { Search, X, ChevronDown, PlusCircle } from "lucide-react";
import OpportunityCard from "@/components/opportunities/OpportunityCard";
import PostOpportunityModal from "@/components/opportunities/PostOpportunityModal";
import ApplyModal from "@/components/opportunities/ApplyModal";
import RecruiterCTA from "@/components/opportunities/RecruiterCTA";
import StartupShowcase from "@/components/opportunities/StartupShowcase";

type TabValue = typeof CATEGORY_ALL | OpportunityCategory;

// Wrapper component that provides the Suspense boundary for useSearchParams
export default function OpportunitiesPage() {
  return (
    <Suspense>
      <OpportunitiesPageInner />
    </Suspense>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { y: 16, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function OpportunitiesPageInner() {
  const { isDarkMode } = useThemeMode();
  const searchParams = useSearchParams();

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<TabValue>(CATEGORY_ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyTarget, setApplyTarget] = useState<any | null>(null);

  const loadOpportunities = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/opportunities");
      setOpportunities(res.data || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load opportunities. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  // Allow opening post modal via URL param
  useEffect(() => {
    if (searchParams?.get("post") === "true") {
      setShowPostModal(true);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesTab = activeTab === CATEGORY_ALL || opp.category === activeTab;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        opp.title.toLowerCase().includes(query) ||
        opp.company.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query) ||
        (opp.skills && opp.skills.some((s: string) => s.toLowerCase().includes(query)));
      return matchesTab && matchesSearch;
    });
  }, [opportunities, activeTab, searchQuery]);

  const handleApply = (opp: any) => {
    setApplyTarget(opp);
    setShowApplyModal(true);
  };

  const jobPostingSchemas = useMemo(() => {
    return opportunities.map((opp) => ({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": opp.title,
      "description": opp.description,
      "datePosted": opp.createdAt ? opp.createdAt.split("T")[0] : "2026-06-20",
      "validThrough": "2026-12-31",
      "employmentType": opp.category === "Full-Time" ? "FULL_TIME" : "INTERN",
      "hiringOrganization": {
        "@type": "Organization",
        "name": opp.company
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": opp.location,
          "addressCountry": "IN"
        }
      }
    }));
  }, [opportunities]);

  return (
    <div
      className={`relative min-h-screen pb-14 pt-24 transition-colors duration-300 sm:pb-20 sm:pt-28 ${
        isDarkMode
          ? "bg-[linear-gradient(180deg,_#090d16_0%,_#0d1424_40%,_#0a0a0a_100%)] text-slate-100"
          : "bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)] text-slate-900"
      }`}
    >
      {jobPostingSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {/* Radial Gradient Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-5 lg:px-6"
      >
        {/* Custom Header Layout */}
        <div className="space-y-6">
          <div className="max-w-3xl">
            <h1 className={`text-2xl font-semibold tracking-tight sm:text-4xl ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Opportunities Across The{" "}
              <span className="text-violet-600 dark:text-violet-600 font-semibold">IIITians Network</span>
            </h1>
            <p className={`mt-3 text-sm leading-6 ${isDarkMode ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
              Discover internships, research positions, open source programs, startup roles, hackathons, and full-time opportunities from recruiters hiring across India's IIIT ecosystem.
            </p>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className={`flex h-11 items-center gap-3 rounded-2xl border px-3.5 shadow-sm transition-all duration-300 focus-within:ring-4 ${
                isDarkMode 
                  ? "border-slate-800 bg-slate-950/80 focus-within:border-indigo-500 focus-within:ring-indigo-500/20" 
                  : "border-slate-200 bg-white/95 focus-within:border-indigo-600 focus-within:ring-indigo-100"
              }`}>
                <Search size={18} className="shrink-0 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search opportunities by title, company, or skills..."
                  className="h-full w-full bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Select Dropdown */}
            <div className="relative w-full sm:w-48">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabValue)}
                className={`h-11 w-full appearance-none rounded-2xl border px-4 py-0 pr-10 text-sm font-semibold transition-all duration-300 focus:ring-4 outline-none ${
                  isDarkMode 
                    ? "border-slate-800 bg-slate-950/80 text-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20" 
                    : "border-slate-200 bg-white/95 text-slate-700 focus:border-indigo-600 focus:ring-indigo-100 shadow-sm"
                }`}
              >
                <option value={CATEGORY_ALL}>All Categories</option>
                <option value="Internships">Internships</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Research">Research</option>
                <option value="Open Source">Open Source</option>
                <option value="Hackathons">Hackathons</option>
                <option value="Startups">Startups</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown size={16} className="text-slate-400" />
              </div>
            </div>

            {/* Post Opportunity Button */}
            <button
              type="button"
              onClick={() => setShowPostModal(true)}
              className="ui-button ui-button-primary flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-2xl px-5 text-sm font-black tracking-wider shadow-md shadow-indigo-500/10 active:scale-95 w-full sm:w-auto"
            >
              <PlusCircle size={15} />
              Post Opportunity
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div id="opportunities-listings" className="scroll-mt-24 mt-8 sm:mt-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >

            {/* Listings Grid */}
            <motion.div variants={item}>
              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-slate-100 rounded w-2/3" />
                          <div className="h-3 bg-slate-100 rounded w-1/3" />
                        </div>
                        <div className="h-6 w-16 bg-slate-100 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-full" />
                        <div className="h-3 bg-slate-100 rounded w-5/6" />
                      </div>
                      <div className="flex gap-2.5 pt-2">
                        <div className="h-5 w-12 bg-slate-100 rounded-full" />
                        <div className="h-5 w-12 bg-slate-100 rounded-full" />
                      </div>
                      <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                        <div className="h-3 bg-slate-100 rounded w-1/4" />
                        <div className="h-8 w-20 bg-slate-100 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div
                  className={`py-12 rounded-2xl border text-center ${
                    isDarkMode
                      ? "border-slate-800 bg-slate-900/20"
                      : "border-slate-200 bg-white/50"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isDarkMode
                        ? "text-slate-400"
                        : "text-slate-650 font-semibold"
                    }`}
                  >
                    No opportunities found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((opp) => (
                    <OpportunityCard
                      key={opp._id || opp.id}
                      opportunity={opp}
                      isDarkMode={isDarkMode}
                      onApply={handleApply}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Bottom Sections Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recruiter CTA */}
              <motion.div variants={item} className="h-full">
                <RecruiterCTA
                  isDarkMode={isDarkMode}
                  onPostClick={() => setShowPostModal(true)}
                />
              </motion.div>

              {/* Startup Showcase */}
              <motion.div variants={item} className="h-full">
                <StartupShowcase
                  isDarkMode={isDarkMode}
                  onPostClick={() => setShowPostModal(true)}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modals */}
      <PostOpportunityModal
        open={showPostModal}
        onClose={() => setShowPostModal(false)}
        isDarkMode={isDarkMode}
      />

      <ApplyModal
        open={showApplyModal}
        opportunity={applyTarget}
        onClose={() => {
          setShowApplyModal(false);
          setApplyTarget(null);
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
