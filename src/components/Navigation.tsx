"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import useThemeMode from "@/hooks/useThemeMode";

const navItems = [
  { name: "Home", href: "/#home" },
  { name: "Institutes", href: "/colleges" },
  { name: "Events", href: "/events" },
  { name: "Placements", href: "/placement" },
  { name: "Legacy", href: "/legacy" },
  { name: "Discuss", href: "/discuss" },
  { name: "Team", href: "/team" },
  { name: "Contact", href: "/contact" },
  { name: "Guide", href: "/guide", highlight: true },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isDarkMode } = useThemeMode();
  const pathname = usePathname();
  const router = useRouter();

  // Hide on admin routes
  if (pathname.includes("/admin")) return null;

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById("hero");
      if (!hero) {
        setIsScrolled(window.scrollY > 10);
        return;
      }
      setIsScrolled(hero.getBoundingClientRect().bottom <= 80);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (event: React.MouseEvent, href: string) => {
    event.preventDefault();
    setIsOpen(false);

    if (href.startsWith("/#")) {
      if (pathname !== "/") {
        router.push("/");
        setTimeout(() => {
          const target = document.getElementById(href.slice(2));
          if (target) {
            window.scrollTo({
              top: target.offsetTop - 80,
              behavior: "smooth",
            });
          }
        }, 150);
        return;
      }

      const target = document.getElementById(href.slice(2));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: "smooth",
        });
      }
      return;
    }

    router.push(href);
  };

  const isSolidNav = isDarkMode || isScrolled;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isSolidNav
            ? isDarkMode
              ? "border-b border-slate-800 bg-slate-950/92 py-2 shadow-[0_10px_40px_rgba(15,23,42,0.3)] backdrop-blur-md"
              : "border-b border-slate-200 bg-white/88 py-2 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-md"
            : "bg-indigo-600 py-4"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={
                isSolidNav
                  ? isDarkMode
                    ? "/IIITians-Network-Logo-Light.png"
                    : "/IIITians-Network-Logo-Blue.png"
                  : "/IIITians-Network-Logo-Light.png"
              }
              width={56}
              height={56}
              className="h-auto w-14 object-contain shrink-0"
              alt="IIITians Network"
            />
            <span
              className={`hidden font-semibold sm:inline transition-colors duration-300 ${
                isDarkMode
                  ? "text-slate-100"
                  : isSolidNav
                    ? "text-indigo-600"
                    : "text-white"
              }`}
            >
              IIITians Network
            </span>
          </Link>

          <div className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => {
              const isActive =
                (item.href === "/#home" && pathname === "/") ||
                (item.href.startsWith("/") &&
                  !item.href.startsWith("/#") &&
                  pathname.startsWith(item.href));

              return item.highlight ? (
                <div key={item.name} className="group relative">
                  <a
                    href={item.href}
                    onClick={(event) => handleNavClick(event, item.href)}
                    className={`relative inline-flex rounded-full px-4 py-2 text-sm font-semibold transition duration-200 active:scale-95 ${
                      isDarkMode
                        ? "bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-400/30 hover:bg-indigo-500/30"
                        : isSolidNav
                          ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-100"
                          : "bg-white/12 text-white ring-1 ring-white/20 hover:bg-white/18"
                    } ${isActive ? "ring-2 ring-indigo-400" : ""}`}
                  >
                    {item.name}
                  </a>
                  <span
                    className={`pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-0 shadow-sm transition duration-200 group-hover:opacity-100 ${
                      isDarkMode
                        ? "bg-slate-900 text-indigo-200 ring-1 ring-slate-700"
                        : "bg-white text-indigo-700 ring-1 ring-indigo-100 shadow-sm"
                    }`}
                  >
                    Learn how to use the site
                  </span>
                </div>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(event) => handleNavClick(event, item.href)}
                  className={`relative text-sm font-medium transition-colors duration-200 py-1 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-center after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                    isActive ? "after:scale-x-100" : "after:scale-x-0"
                  } ${
                    isDarkMode
                      ? `after:bg-indigo-400 hover:text-white ${
                          isActive ? "text-white" : "text-slate-200"
                        }`
                      : isSolidNav
                        ? `after:bg-indigo-600 hover:text-indigo-600 ${
                            isActive ? "text-indigo-600" : "text-slate-700"
                          }`
                        : `after:bg-white hover:text-white ${
                            isActive ? "text-white" : "text-slate-100"
                          }`
                  }`}
                >
                  {item.name}
                </a>
              );
            })}
          </div>

          <button onClick={() => setIsOpen(true)} className="md:hidden">
            <Menu
              className={`h-6 w-6 ${
                isDarkMode
                  ? "text-slate-100"
                  : isSolidNav
                    ? "text-indigo-600"
                    : "text-white"
              }`}
            />
          </button>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-72 transform shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-800"}`}
      >
        <div
          className={`flex items-center justify-between px-5 py-4 ${
            isDarkMode ? "border-b border-slate-800" : "border-b border-slate-200"
          }`}
        >
          <span
            className={`font-semibold ${
              isDarkMode ? "text-slate-100" : "text-indigo-600"
            }`}
          >
            Menu
          </span>
          <button onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const isActive =
              (item.href === "/#home" && pathname === "/") ||
              (item.href.startsWith("/") &&
                !item.href.startsWith("/#") &&
                pathname.startsWith(item.href));

            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.href)}
                className={`flex flex-col rounded-xl px-4 py-3 font-medium transition ${
                  item.highlight
                    ? isActive
                      ? isDarkMode
                        ? "bg-indigo-500/25 text-indigo-100 ring-2 ring-indigo-400"
                        : "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400"
                      : isDarkMode
                        ? "bg-indigo-500/15 text-indigo-100 ring-1 ring-indigo-400/30 hover:bg-indigo-500/25"
                        : "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-100"
                    : isActive
                      ? isDarkMode
                        ? "bg-slate-900 text-white"
                        : "bg-indigo-50 text-indigo-700"
                      : isDarkMode
                        ? "text-slate-100 hover:bg-slate-900"
                        : "text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-80">
                    Learn how to use
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </aside>
    </>
  );
}
