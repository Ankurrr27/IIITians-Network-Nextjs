import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Placements",
  description: "Branch-wise placement statistics across IIITs — highest, average, and lowest packages by year.",
};

export default function PlacementLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
