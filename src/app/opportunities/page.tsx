"use client";

import React, { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import useThemeMode from "@/hooks/useThemeMode";
import { opportunities, CATEGORY_ALL } from "@/data/opportunities";
import type { OpportunityCategory } from "@/data/opportunities";

import OpportunitiesHero from "@/components/opportunities/OpportunitiesHero";
import TrustBar from "@/components/opportunities/TrustBar";
import CategoryTabs from "@/components/opportunities/CategoryTabs";
import OpportunityFilters from "@/components/opportunities/OpportunityFilters";
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

  const [activeTab, setActiveTab] = useState<TabValue>(CATEGORY_ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyTarget, setApplyTarget] = useState<(typeof opportunities)[0] | null>(null);

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
        opp.skills.some((s) => s.toLowerCase().includes(query));
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const handleApply = (opp: (typeof opportunities)[0]) => {
    setApplyTarget(opp);
    setShowApplyModal(true);
  };

  const jobPostingSchemas = useMemo(() => {
    return opportunities.map((opp) => ({
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": opp.title,
      "description": opp.description,
      "datePosted": "2026-06-20",
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
  }, []);

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
        {/* Hero */}
        <OpportunitiesHero
          isDarkMode={isDarkMode}
          onPostClick={() => setShowPostModal(true)}
        />

        {/* Trust Bar */}
        <motion.div variants={item} initial="hidden" animate="show" className="mb-8">
          <TrustBar isDarkMode={isDarkMode} />
        </motion.div>

        {/* Filters Section */}
        <div id="opportunities-listings" className="scroll-mt-24">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Tabs + Search */}
            <motion.div
              variants={item}
              className="grid gap-4 sm:flex sm:items-center sm:justify-between"
            >
              <CategoryTabs
                active={activeTab}
                onChange={setActiveTab}
                isDarkMode={isDarkMode}
              />
              <OpportunityFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isDarkMode={isDarkMode}
              />
            </motion.div>

            {/* Listings Grid */}
            <motion.div variants={item}>
              {filtered.length === 0 ? (
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
                        : "text-slate-500 font-semibold"
                    }`}
                  >
                    No opportunities found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      isDarkMode={isDarkMode}
                      onApply={handleApply}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recruiter CTA */}
            <motion.div variants={item}>
              <RecruiterCTA
                isDarkMode={isDarkMode}
                onPostClick={() => setShowPostModal(true)}
              />
            </motion.div>

            {/* Startup Showcase */}
            <motion.div variants={item}>
              <StartupShowcase
                isDarkMode={isDarkMode}
                onPostClick={() => setShowPostModal(true)}
              />
            </motion.div>
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
