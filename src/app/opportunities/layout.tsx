import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IIIT Internships & Opportunities",
  description: "Discover verified internships, research roles, full-time positions, and startup roles across the Indian Institute of Information Technology (IIIT) network. Connecting recruiters with early tech talent.",
  keywords: [
    "IIIT internships",
    "IIIT opportunities",
    "IIIT startup ecosystem",
    "IIIT student community",
    "IIIT alumni network",
    "software engineering internships",
    "tech jobs"
  ],
  alternates: {
    canonical: "https://iiitiansnetwork.in/opportunities",
  },
  openGraph: {
    title: "IIIT Internships & Opportunities | IIITians Network",
    description: "Discover verified internships, research roles, and startup positions across the IIIT network. Apply today with your IIIT email.",
    url: "https://iiitiansnetwork.in/opportunities",
    type: "website",
  },
};

export default function OpportunitiesLayout({ children }: { children: React.ReactNode }) {
  const oppsBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://iiitiansnetwork.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Opportunities",
        "item": "https://iiitiansnetwork.in/opportunities"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(oppsBreadcrumbSchema) }}
      />
      {children}
    </>
  );
}
