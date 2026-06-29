import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import SmoothScrolling from "@/components/SmoothScrolling";
import SplashProvider from "@/components/SplashProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://iiitiansnetwork.in"),
  title: { default: "IIITians Network Connect", template: "%s | IIITians Network" },
  description:
    "A student-led community connecting IIIT students, alumni, and aspirants across India through data, collaboration, and shared opportunities.",
  keywords: [
    "IIIT alumni network",
    "IIIT student community",
    "IIIT internships",
    "IIIT opportunities",
    "IIIT events",
    "IIIT startup ecosystem",
    "IIIT clubs",
    "IIIT",
    "IIITians",
    "placements",
    "colleges"
  ],
  alternates: {
    canonical: "https://iiitiansnetwork.in",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    siteName: "IIITians Network Connect",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IIITians Network Connect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IIITians Network Connect",
    description:
      "A student-led community connecting IIIT students, alumni, and aspirants across India through data, collaboration, and shared opportunities.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans bg-background text-foreground">
        <SmoothScrolling>
          <SplashProvider>
            <AppShell>{children}</AppShell>
          </SplashProvider>
        </SmoothScrolling>
      </body>
    </html>
  );
}
