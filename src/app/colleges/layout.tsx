import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IIIT Directory & Campus Hubs",
  description: "Explore all 31 Indian Institutes of Information Technology (IIITs). Search and compare campuses, locations, fests, clubs, and official web directories.",
  keywords: [
    "IIIT directory",
    "IIIT campuses",
    "IIIT clubs",
    "compare IIITs",
    "IIIT student community",
    "list of IIITs"
  ],
  alternates: {
    canonical: "https://iiitiansnetwork.in/colleges",
  },
  openGraph: {
    title: "IIIT Directory & Campus Hubs | IIITians Network",
    description: "Search, compare, and explore fests, clubs, and student hubs across all 31 IIITs.",
    url: "https://iiitiansnetwork.in/colleges",
    type: "website",
  },
};

export default function CollegesLayout({ children }: { children: React.ReactNode }) {
  const collegesBreadcrumbSchema = {
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
        "name": "Colleges",
        "item": "https://iiitiansnetwork.in/colleges"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collegesBreadcrumbSchema) }}
      />
      {children}
    </>
  );
}
