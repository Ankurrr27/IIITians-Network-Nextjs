import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team & Contributors",
  description: "Meet the autonomous, student-driven team behind the IIITians Network platform. Discover our coordinators, developers, and designers working across IIITs.",
  keywords: [
    "IIITians Network team",
    "IIIT student community coordinators",
    "IIIT developers",
    "student community leaders"
  ],
  alternates: {
    canonical: "https://iiitiansnetwork.com/team",
  },
  openGraph: {
    title: "Our Team & Contributors | IIITians Network",
    description: "Meet the coordinators, developers, and designers building the nationwide IIIT network.",
    url: "https://iiitiansnetwork.com/team",
    type: "website",
  },
};

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  const teamBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://iiitiansnetwork.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Team",
        "item": "https://iiitiansnetwork.com/team"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teamBreadcrumbSchema) }}
      />
      {children}
    </>
  );
}
