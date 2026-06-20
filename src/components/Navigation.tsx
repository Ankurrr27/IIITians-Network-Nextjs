"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Award,
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  CalendarPlus,
  Camera,
  ChevronDown,
  FileText,
  HelpCircle,
  Instagram,
  Mail,
  Megaphone,
  Menu,
  PlusCircle,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import useThemeMode from "@/hooks/useThemeMode";

const navItems: Array<{ name: string; href: string; highlight?: boolean }> = [
  { name: "Home", href: "/#home" },
  { name: "IIITs", href: "/colleges" },
  { name: "Community", href: "/discuss" },
  { name: "Events", href: "/events" },
  { name: "Opportunities", href: "/opportunities" },
  { name: "Merchandise", href: "/merchandise" },
  { name: "Contact", href: "/contact" },
];

const quickLinks = {
  Institutes: [
    { title: "Explore Institutes", subtitle: "Browse and compare all IIITs", href: "/colleges", icon: Building2 },
    { title: "Add Campus Images", subtitle: "Share campus memories", href: "/gallery", icon: Camera },
    { title: "Gallery Guide", subtitle: "How campus photos are approved", href: "/guide?flow=gallery", icon: BookOpenText },
    { title: "Register your Club", subtitle: "Create a student club account", href: "/discuss?clubAccount=true", icon: PlusCircle },
    { title: "Club Register Guide", subtitle: "Steps for club verification", href: "/guide?flow=club-register", icon: HelpCircle },
  ],
  Events: [
    { title: "Explore Events", subtitle: "See public events and updates", href: "/events", icon: CalendarPlus },
    { title: "Register Your Event", subtitle: "Post through a club account", href: "/discuss?clubAccount=true", icon: Megaphone },
    { title: "Event Guide", subtitle: "Learn how event posting works", href: "/guide?flow=events", icon: BookOpenText },
  ],
  Placements: [
    { title: "Placement Explorer", subtitle: "Compare college placement data", href: "/placement", icon: BriefcaseBusiness },
    { title: "How to Read Placements", subtitle: "Understand branches and stats", href: "/guide?flow=placement", icon: HelpCircle },
  ],
  Legacy: [
    { title: "Network Legacy", subtitle: "Browse legacy members", href: "/legacy", icon: Award },
    { title: "Register Your Account", subtitle: "Submit your legacy profile", href: "/legacy#legacy-form", icon: UserPlus },
    // { title: "Get Certificate", subtitle: "Open your legacy certificate", href: "/legacy/certificate", icon: FileText },
    { title: "Legacy Guide", subtitle: "How legacy approval works", href: "/guide?flow=legacy", icon: BookOpenText },
  ],
  Discuss: [
    { title: "Make Announcement", subtitle: "Post an update as a club", href: "/discuss?clubAccount=true", icon: Megaphone },
    { title: "Register Your Club", subtitle: "Create a discuss account", href: "/discuss?clubAccount=true&mode=register", icon: PlusCircle },
    { title: "Discuss Guide", subtitle: "Posting and moderation flow", href: "/guide?flow=discuss", icon: BookOpenText },
  ],
  Team: [
    { title: "Meet the Team", subtitle: "See IIITians Network members", href: "/team", icon: Users },
    { title: "Register into Network", subtitle: "Fill the team form", href: "/team/join", icon: UserPlus },
    { title: "Team Guide", subtitle: "Learn how team joining works", href: "/guide?flow=team", icon: BookOpenText },
  ],
  Contact: [
    { title: "Email", subtitle: "Official inquiries and collaboration", href: "mailto:iiitiansnetwork@gmail.com", icon: Mail },
    { title: "Instagram", subtitle: "Updates, highlights, and fast messages", href: "https://www.instagram.com/iiitiansnetwork", icon: Instagram },
    { title: "Contact Page", subtitle: "All official channels", href: "/contact", icon: Megaphone },
  ],
  Guide: [
    { title: "Site Guide", subtitle: "Learn how to use everything", href: "/guide", icon: BookOpenText },
    { title: "Find a Flow", subtitle: "Search for the right workflow", href: "/sitemap", icon: Search },
  ],
} as const;

type QuickLinkGroup = keyof typeof quickLinks;

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileQuickOpen, setMobileQuickOpen] = useState("");
  const { isDarkMode } = useThemeMode();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsOpen(false);
    setMobileQuickOpen("");
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

  if (pathname.includes("/admin")) return null;

  const handleNavClick = (event: React.MouseEvent, href: string) => {
    event.preventDefault();
    setIsOpen(false);

    if (href.startsWith("/#")) {
      if (pathname !== "/") {
        router.push("/");
        setTimeout(() => {
          const target = document.getElementById(href.slice(2));
          if (target) {
            window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
          }
        }, 150);
        return;
      }

      const target = document.getElementById(href.slice(2));
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
      }
      return;
    }

    router.push(href);
  };

  const isSolidNav = isDarkMode || isScrolled;

  const isNavActive = (item: { name: string; href: string }) => {
    if (item.href === "/#home") return pathname === "/";
    if (item.name === "Institutes") {
      return (
        pathname.startsWith("/colleges") ||
        pathname.startsWith("/gallery") ||
        (pathname.startsWith("/discuss") && searchParams?.get("clubAccount") === "true")
      );
    }
    return item.href.startsWith("/") && !item.href.startsWith("/#") && pathname.startsWith(item.href);
  };

  const navTextClass = (active: boolean) =>
    `relative inline-flex items-center gap-1 text-[13px] font-medium transition-colors duration-200 py-1 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-center after:transition-transform after:duration-300 hover:after:scale-x-100 ${
      active ? "after:scale-x-100" : "after:scale-x-0"
    } ${
      isDarkMode
        ? `after:bg-indigo-400 hover:text-white ${active ? "text-white" : "text-slate-200"}`
        : isSolidNav
          ? `after:bg-indigo-600 hover:text-indigo-600 ${active ? "text-indigo-600" : "text-slate-700"}`
          : `after:bg-white hover:text-white ${active ? "text-white" : "text-slate-100"}`
    }`;

  const dropdownClass = `rounded-xl border p-1.5 shadow-2xl ${
    isDarkMode
      ? "border-slate-800 bg-slate-900 text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      : "border-slate-100 bg-white text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
  }`;

  const rowClass = `flex items-start gap-2.5 rounded-lg px-3 py-2 transition ${
    isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-50"
  }`;

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isSolidNav
            ? isDarkMode
              ? "border-b border-slate-800 bg-slate-950/92 py-1.5 shadow-[0_10px_40px_rgba(15,23,42,0.3)] backdrop-blur-md"
              : "border-b border-slate-200 bg-white/90 py-1.5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-md"
            : "bg-indigo-600 py-2"
        }`}
      >
        <div className="ui-page-shell flex items-center justify-between gap-3">
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
              className="h-auto w-10 shrink-0 object-contain"
              alt="IIITians Network"
            />
            <span
              className={`hidden font-semibold transition-colors duration-300 sm:inline ${
                isDarkMode ? "text-slate-100" : isSolidNav ? "text-indigo-600" : "text-white"
              }`}
            >
              IIITians Network
            </span>
          </Link>

          <div className="hidden items-center gap-2.5 md:flex">
            {navItems.map((item) => {
              const active = isNavActive(item);
              const links = quickLinks[item.name as QuickLinkGroup];

              if (item.highlight) {
                return (
                  <div key={item.name} className="group relative py-2">
                    <a
                      href={item.href}
                      onClick={(event) => handleNavClick(event, item.href)}
                       className={`relative inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold transition duration-200 active:scale-95 ${
                        isDarkMode
                          ? "bg-indigo-500/20 text-indigo-100 ring-1 ring-indigo-400/30 hover:bg-indigo-500/30"
                          : isSolidNav
                            ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-100"
                            : "bg-white/12 text-white ring-1 ring-white/20 hover:bg-white/18"
                      } ${active ? "ring-2 ring-indigo-400" : ""}`}
                    >
                      {item.name}
                    </a>
                    {links && <QuickDropdown links={links} dropdownClass={dropdownClass} rowClass={rowClass} isDarkMode={isDarkMode} />}
                  </div>
                );
              }

              return (
                <div key={item.name} className="group relative py-2">
                  <a
                    href={item.href}
                    onClick={(event) => handleNavClick(event, item.href)}
                    className={navTextClass(active)}
                  >
                    <span>{item.name}</span>
                  </a>
                  {links && <QuickDropdown links={links} dropdownClass={dropdownClass} rowClass={rowClass} isDarkMode={isDarkMode} />}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className={`md:hidden rounded-lg p-2 transition-colors focus:outline-none ${
              isSolidNav
                ? isDarkMode
                  ? "text-slate-100 hover:bg-slate-800"
                  : "text-slate-700 hover:bg-slate-100"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Open navigation"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {isOpen && <div className="fixed inset-0 z-40 bg-slate-950/40" onClick={() => setIsOpen(false)} />}

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[min(16rem,calc(100vw-0.5rem))] transform shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${isDarkMode ? "bg-slate-950 text-slate-100" : "bg-white text-slate-800"}`}
      >
        <div className={`flex items-center justify-between px-5 py-4 ${isDarkMode ? "border-b border-slate-800" : "border-b border-slate-200"}`}>
          <span className={`font-semibold ${isDarkMode ? "text-slate-100" : "text-indigo-600"}`}>Menu</span>
          <button onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={`flex flex-col gap-1 p-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]`}>
          {navItems.map((item) => {
            const active = isNavActive(item);
            const links = quickLinks[item.name as QuickLinkGroup];
            const isExpanded = mobileQuickOpen === item.name;

            if (links) {
              return (
                <div key={item.name} className="flex flex-col">
                  {/* Label navigates to page; chevron toggles sub-links */}
                  <div className={`flex items-center rounded-xl font-medium transition ${
                    active
                      ? isDarkMode ? "bg-slate-900 text-white" : "bg-indigo-50 text-indigo-700"
                      : isDarkMode ? "text-slate-100 hover:bg-slate-900" : "text-indigo-600 hover:bg-indigo-50"
                  }`}>
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="flex-1 px-4 py-3 text-sm font-medium"
                    >
                      {item.name}
                    </a>
                    <button
                      onClick={() => setMobileQuickOpen(isExpanded ? "" : item.name)}
                      className="px-3 py-3"
                      aria-label={`Toggle ${item.name} submenu`}
                    >
                      <ChevronDown size={15} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className={`ml-4 mt-0.5 flex flex-col gap-0.5 border-l pl-2 ${isDarkMode ? "border-slate-800" : "border-indigo-100"}`}>
                      {links.map((link) => {
                        const Icon = link.icon;
                        return (
                          <a
                            key={link.href}
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                              isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-indigo-600"
                            }`}
                          >
                            <Icon size={13} />
                            {link.title}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.href)}
                className={`flex flex-col rounded-xl px-4 py-3 font-medium transition ${
                  item.highlight
                    ? active
                      ? isDarkMode
                        ? "bg-indigo-500/25 text-indigo-100 ring-2 ring-indigo-400"
                        : "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400"
                      : isDarkMode
                        ? "bg-indigo-500/15 text-indigo-100 ring-1 ring-indigo-400/30 hover:bg-indigo-500/25"
                        : "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-100"
                    : active
                      ? isDarkMode ? "bg-slate-900 text-white" : "bg-indigo-50 text-indigo-700"
                      : isDarkMode ? "text-slate-100 hover:bg-slate-900" : "text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-80">Learn how to use</span>
                )}
              </a>
            );
          })}
        </div>
      </aside>
    </>
  );
}

function QuickDropdown({
  links,
  dropdownClass,
  rowClass,
  isDarkMode,
}: {
  links: readonly { title: string; subtitle: string; href: string; icon: React.ElementType }[];
  dropdownClass: string;
  rowClass: string;
  isDarkMode: boolean;
}) {
  return (
    <div className="invisible absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 translate-y-2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className={dropdownClass}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className={rowClass}>
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isDarkMode ? "text-indigo-300" : "text-indigo-600"}`} />
              <span className="min-w-0">
                <span className={`block text-sm font-bold leading-5 ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{link.title}</span>
                <span className={`mt-0.5 block text-xs leading-5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{link.subtitle}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
