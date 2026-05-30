import Link from "next/link";
import { ArrowRight, Compass, Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[linear-gradient(180deg,_#eef6ff_0%,_#f8fbff_42%,_#ffffff_100%)] px-4 py-10 sm:px-6 sm:py-14">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_18%_18%,rgba(99,102,241,0.18),transparent_0_22%),radial-gradient(circle_at_80%_22%,rgba(56,189,248,0.18),transparent_0_20%),radial-gradient(circle_at_56%_82%,rgba(147,197,253,0.16),transparent_0_26%)]" />

      <div className="relative mx-auto flex min-h-[70vh] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center">
          <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 shadow-[0_24px_70px_rgba(148,163,184,0.15)] backdrop-blur-sm sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 shadow-sm">
              <Compass className="h-4 w-4" />
              Route Not Found
            </div>

            <div className="mt-6 flex items-end gap-4">
              <div className="text-[78px] font-semibold leading-none tracking-[-0.05em] text-slate-900 sm:text-[110px]">
                404
              </div>
              <div className="pb-3 text-sm font-medium uppercase tracking-[0.3em] text-indigo-600">
                Broken Route
              </div>
            </div>

            <h1 className="mt-4 max-w-2xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              This page wandered off the map.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              The link may be outdated, the route may have changed, or the URL might
              have a typo. You can jump back into the network from the main pages below.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_44px_rgba(15,23,42,0.24)]"
              >
                <Home className="h-4 w-4" />
                Go to Home
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/legacy"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-sm"
              >
                Explore Legacy
              </Link>

              <Link
                href="/team"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-sm"
              >
                Open Team
              </Link>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(240,247,255,0.94))] p-6 shadow-[0_24px_60px_rgba(148,163,184,0.14)] backdrop-blur-sm sm:p-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Sparkles className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-slate-900">
              Quick places to continue
            </h2>

            <div className="mt-6 space-y-3">
              {[
                {
                  title: "Legacy Directory",
                  description: "Browse alumni, seniors, roles, companies, and stories.",
                  href: "/legacy",
                },
                {
                  title: "Placement Hub",
                  description: "Open placement stats, trends, and preparation resources.",
                  href: "/placement",
                },
                {
                  title: "Discuss",
                  description: "Move straight into community conversations and updates.",
                  href: "/discuss",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-[1.35rem] border border-slate-200/80 bg-white/90 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">
                        {item.description}
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>

            <p className="mt-6 text-xs leading-6 text-slate-500">
              If this route should exist, the URL is probably wrong or the page has been
              moved.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
