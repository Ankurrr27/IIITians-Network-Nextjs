"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import InAppNotifications from "@/components/InAppNotifications";
import Navigation from "@/components/Navigation";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeModeProvider } from "@/hooks/useThemeMode";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname === "/admin" || pathname.includes("/admin");

  return (
    <ThemeModeProvider>
      {!isAdminPage && <Navigation />}
      {!isAdminPage && <InAppNotifications />}
      <ScrollToTop />
      <main>{children}</main>
      {!isAdminPage && <Footer />}
    </ThemeModeProvider>
  );
}
