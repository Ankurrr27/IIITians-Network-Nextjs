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
  openGraph: {
    siteName: "IIITians Network Connect",
    type: "website",
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
