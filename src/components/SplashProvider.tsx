"use client";

import { useEffect, useState } from "react";
import LogoLoader from "@/components/LogoLoader";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasShownSplash = sessionStorage.getItem("hasShownSplash");
    if (hasShownSplash) {
      setShowSplash(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("hasShownSplash", "true");
    }, 2500); // 2.5s allows the LogoLoader animation to complete beautifully once

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
          >
            <LogoLoader size="h-16 w-64 sm:h-24 sm:w-[22rem]" text="" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* We keep children in the DOM so it pre-loads, but hide overflow if splash is active to prevent scrolling */}
      <div className={showSplash ? "h-screen overflow-hidden pointer-events-none" : ""}>
         {children}
      </div>
    </>
  );
}
