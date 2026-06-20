import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import NetworkVisualization from "@/components/home/NetworkVisualization";
import StakeholdersSection from "@/components/home/StakeholdersSection";
import AboutSection from "@/components/home/AboutSection";
import EventsPreviewSection from "@/components/home/EventsPreviewSection";
import DiscussPreviewSection from "@/components/home/DiscussPreviewSection";
import FounderSection from "@/components/home/FounderSection";
import CounsellingSection from "@/components/home/CounsellingSection";
import OpportunitiesSection from "@/components/home/OpportunitiesSection";
import EventCoverageSection from "@/components/home/EventCoverageSection";
import CollaborateSection from "@/components/home/CollaborateSection";
import DevelopersSection from "@/components/home/DevelopersSection";
import ExploreYourIIITSection from "@/components/home/ExploreYourIIITSection";
import NetworkReachSection from "@/components/home/NetworkReachSection";

export const metadata: Metadata = {
  title: "IIITians Network Connect — Home",
  description: "Connecting IIIT students, alumni, and aspirants across India through data, collaboration, and shared opportunities.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
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

      {/* 9. Event Coverage Section */}
      <EventCoverageSection />

      {/* 10. Collaborate With Us */}
      <CollaborateSection />

      {/* 11. Founders & Team Section */}
      <FounderSection />

      {/* 12. Network Reach Section */}
      <NetworkReachSection />

      {/* 13. Counselling Section */}
      <CounsellingSection />

      {/* 14. Contact Developers Section */}
      <DevelopersSection />
    </div>
  );
}
