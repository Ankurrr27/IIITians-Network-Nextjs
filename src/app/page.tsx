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
      <CounsellingSection />
      <EventsPreviewSection />
      <DiscussPreviewSection />

      {/* 5. Opportunities Section */}
      <OpportunitiesSection />

      {/* 6. Event Coverage Section */}
      <EventCoverageSection />

      {/* 7. Collaborate With Us */}
      <CollaborateSection />

      {/* 8. Founders & Contact Developers */}
      <FounderSection />
      <DevelopersSection />
    </div>
  );
}
