import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import EventsPreviewSection from "@/components/home/EventsPreviewSection";
import DiscussPreviewSection from "@/components/home/DiscussPreviewSection";
import FounderSection from "@/components/home/FounderSection";
import CounsellingSection from "@/components/home/CounsellingSection";

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

      {/* 3. Events Preview Section */}
      <EventsPreviewSection />

      {/* 4. Discuss Preview Section */}
      <DiscussPreviewSection />

      {/* 5. Team & Founders Section */}
      <FounderSection />

      {/* 6. Counselling Section */}
      <CounsellingSection />
    </div>
  );
}
