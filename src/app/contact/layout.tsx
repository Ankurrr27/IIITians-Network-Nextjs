import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Reach out to the IIITians Network team — feedback, collaborations, or questions.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
