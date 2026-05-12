"use client";
import { Globe, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import RequireAdmin from "@/components/RequireAdmin";

const adminLinks = [
  { label: "Network Legacy", href: "/legacy/admin" },
  { label: "Colleges", href: "/colleges/admin" },
  { label: "Events", href: "/events/admin" },
  { label: "Discuss", href: "/discuss/admin" },
  { label: "Team", href: "/team/admin" },
  { label: "Placements", href: "/placement/admin" },
  { label: "Notifications", href: "/admin/notifications" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Guide", href: "/admin/guide" },
];

function AdminNav({ isMenuOpen, setIsMenuOpen }: { isMenuOpen: boolean; setIsMenuOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.replace("/admin");
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Drawer */}
      <aside className={`fixed bottom-0 right-0 top-0 z-[70] w-72 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Admin Menu</span>
            <button onClick={() => setIsMenuOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-50">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-4 custom-scrollbar">
            {adminLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${pathname.startsWith(link.href) ? "bg-slate-900 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-slate-100 p-4 space-y-2">
            <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <Globe className="h-4 w-4" /> Public Site
            </a>
            <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 sm:py-2.5">
          <div className="flex items-center gap-3">
            <Image src="/IIITians-Network-Logo-Blue.png" alt="IIITians Network" width={32} height={32}
              className="hidden h-8 w-auto sm:block mix-blend-multiply" style={{ filter: "hue-rotate(240deg) saturate(1.8) brightness(0.9)" }} />
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-700 sm:text-xs">
                <ShieldCheck className="h-3 w-3" /> Admin
              </div>
              <h1 className="mt-0.5 text-base font-semibold tracking-tight text-slate-900 sm:text-lg">IIITians Network Admin</h1>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            <nav className="flex items-center gap-1">
              {adminLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${pathname.startsWith(link.href) ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-white hover:text-indigo-600">
                <Globe className="h-3.5 w-3.5" /> Public Site
              </a>
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/80 px-3 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-100">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-full bg-slate-100 p-2 text-slate-600 shadow-sm transition hover:bg-slate-200 lg:hidden">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setIsMenuOpen(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = isMenuOpen ? "hidden" : "unset"; }, [isMenuOpen]);

  // Don't wrap /admin (login page) with the layout guard
  if (pathname === "/admin") return <>{children}</>;

  return (
    <RequireAdmin>
      <div className="relative min-h-screen bg-[linear-gradient(180deg,_#eef7ff_0%,_#f7fbff_36%,_#f9fcff_100%)]">
        <div className="pointer-events-none fixed inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <AdminNav isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10">{children}</main>
          <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-[12px] font-medium text-slate-500">&copy; {new Date().getFullYear()} IIITians Network. Secure Internal Portal.</p>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-500/80">Authenticated Session</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </RequireAdmin>
  );
}
