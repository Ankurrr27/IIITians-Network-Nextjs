import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import InAppNotifications from "@/components/InAppNotifications";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeModeProvider } from "@/hooks/useThemeMode";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "IIITians Network Connect", template: "%s | IIITians Network" },
  description:
    "A student-led community connecting IIIT students, alumni, and aspirants across India through data, collaboration, and shared opportunities.",
  keywords: ["IIIT", "IIITians", "network", "alumni", "placements", "events", "colleges"],
  icons: {
    icon: [
      { url: "/favicon.ico" },
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-foreground`}>
        <ThemeModeProvider>
          <ScrollToTop />
          <Navigation />
          <main>{children}</main>
          <Footer />
          <InAppNotifications />
        </ThemeModeProvider>
      </body>
    </html>
  );
}
