import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Guide",
  description: "Complete guide to using the IIITians Network platform — for students, clubs, and admins.",
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
