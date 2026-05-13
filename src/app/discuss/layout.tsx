import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discuss",
  description: "Network-wide updates, announcements, and collaboration opportunities from clubs across IIITs.",
};

export default function DiscussLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
