import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import NetworkVisualization from "@/components/home/NetworkVisualization";
import StakeholdersSection from "@/components/home/StakeholdersSection";
import AboutSection from "@/components/home/AboutSection";
import EventsPreviewSection from "@/components/home/EventsPreviewSection";
import DiscussPreviewSection from "@/components/home/DiscussPreviewSection";
import FounderSection from "@/components/home/FounderSection";
import CounsellingSection from "@/components/home/CounsellingSection";
import FAQSection from "@/components/home/FAQSection";
import OpportunitiesSection from "@/components/home/OpportunitiesSection";

import CollaborateSection from "@/components/home/CollaborateSection";
import DevelopersSection from "@/components/home/DevelopersSection";
import ExploreYourIIITSection from "@/components/home/ExploreYourIIITSection";
import NetworkReachSection from "@/components/home/NetworkReachSection";

export const metadata: Metadata = {
  title: "IIITians Network Connect — Home",
  description: "Connecting IIIT students, alumni, and aspirants across India through data, collaboration, and shared opportunities.",
};

export default function HomePage() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "IIITians Network",
    "url": "https://iiitiansnetwork.in",
    "logo": "https://iiitiansnetwork.in/favicon-32x32.png",
    "description": "An autonomous student-led community connecting all 31 Indian Institutes of Information Technology (IIITs) across India.",
    "sameAs": [
      "https://linkedin.com/company/iiitians-network",
      "https://instagram.com/iiitiansnetwork",
      "https://x.com/iiitiansnetwork",
      "https://www.youtube.com/@iiitiansnetwork"
    ]
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "IIITians Network Connect",
    "url": "https://iiitiansnetwork.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://iiitiansnetwork.in/colleges?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Global JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. IIIT Network Visualization */}
      <NetworkVisualization />

      {/* 3. What Makes IIITians Network Different (Stakeholders) */}
      <StakeholdersSection />

      {/* 4. Community Highlights & About */}
      <AboutSection />

      {/* 5. Explore Your IIIT */}
      <ExploreYourIIITSection />

      {/* 6. Events Preview Section */}
      <EventsPreviewSection />

      {/* 7. Discuss Preview Section */}
      <DiscussPreviewSection />

      {/* 8. Opportunities Section */}
      <OpportunitiesSection />


      {/* 10. Collaborate With Us */}
      <CollaborateSection />

      {/* 11. Founders & Team Section */}
      <FounderSection />

      {/* 12. Network Reach Section */}
      <NetworkReachSection />

      {/* 13. Counselling Section */}
      <CounsellingSection />

      {/* 13.5 FAQ Section */}
      <FAQSection />

      {/* 14. Contact Developers Section */}
      <DevelopersSection />
    </div>
  );
}
