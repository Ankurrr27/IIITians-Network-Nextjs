"use client";
import { Moon, Sun } from "lucide-react";
import useThemeMode from "@/hooks/useThemeMode";
export default function ThemeToggle() {
  const { isDarkMode, toggleThemeMode } = useThemeMode();
  return (
    <button
      onClick={toggleThemeMode}
      aria-label="Toggle theme"
      className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
