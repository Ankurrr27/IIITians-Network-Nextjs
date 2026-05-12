"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "iiitians-theme-mode";

interface ThemeModeContextValue {
  isDarkMode: boolean;
  themeMode: "light" | "dark";
  toggleThemeMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem(STORAGE_KEY) as "light" | "dark") || "light";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, themeMode);
    document.documentElement.dataset.theme = themeMode;
    document.body.dataset.theme = themeMode;
  }, [themeMode]);

  const value = useMemo(
    () => ({
      isDarkMode: themeMode === "dark",
      themeMode,
      toggleThemeMode() {
        setThemeMode((c) => (c === "light" ? "dark" : "light"));
      },
    }),
    [themeMode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export default function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeModeProvider");
  return ctx;
}
