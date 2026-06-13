import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import EventsPreviewSection from "@/components/home/EventsPreviewSection";
import DiscussPreviewSection from "@/components/home/DiscussPreviewSection";
import FounderSection from "@/components/home/FounderSection";
import CounsellingSection from "@/components/home/CounsellingSection";
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

      {/* 2. About & Initiatives Section */}
      <AboutSection />

      {/* 3. Explore Your IIIT */}
      <ExploreYourIIITSection />

      {/* 4. Events Preview Section */}
      <EventsPreviewSection />

      {/* 5. Discuss Preview Section */}
      <DiscussPreviewSection />

      {/* 6. Team & Founders Section */}
      <FounderSection />

      {/* 7. Network Reach Section */}
      <NetworkReachSection />

      {/* 8. Counselling Section */}
      <CounsellingSection />
    </div>
  );
}
