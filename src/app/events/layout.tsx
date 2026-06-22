import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IIIT Campus Events & Hackathons",
  description: "Browse verified hackathons, fests, technical events, workshops, and webinars across all 25+ IIITs. Connect with other campus communities.",
  keywords: [
    "IIIT events",
    "IIIT student community",
    "IIIT campus fests",
    "IIIT hackathons",
    "IIIT clubs",
    "college fests India"
  ],
  alternates: {
    canonical: "https://iiitiansnetwork.com/events",
  },
  openGraph: {
    title: "IIIT Campus Events & Hackathons | IIITians Network",
    description: "Browse and discover fests, hackathons, and technical events across all IIIT campuses.",
    url: "https://iiitiansnetwork.com/events",
    type: "website",
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  const eventBreadcrumbSchema = {
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
        "name": "Events",
        "item": "https://iiitiansnetwork.com/events"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventBreadcrumbSchema) }}
      />
      {children}
    </>
  );
}
