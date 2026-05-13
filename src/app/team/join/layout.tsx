import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Team",
  description: "Apply to join the IIITians Network team — core, tech, design, content, and social media positions.",
};

export default function TeamJoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
