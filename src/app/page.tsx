import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IIITians Network Connect — Home",
  description: "Connecting IIIT students, alumni, and aspirants across India through data, collaboration, and shared opportunities.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <section
        id="hero"
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-indigo-600"
      >
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_60%_40%,rgba(139,92,246,0.35),transparent_55%),radial-gradient(ellipse_at_20%_80%,rgba(59,130,246,0.3),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-200">
            India&apos;s Premier IIIT Community
          </p>
          <h1 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl">
            IIITians<br /><span className="text-indigo-200">Network</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100 sm:text-xl">
            Connecting IIIT students, alumni,  clubbers, and aspirants across India through data,
            collaboration, and shared opportunities.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="/colleges" className="rounded-full bg-white px-8 py-3 text-sm font-bold text-indigo-700 shadow-xl shadow-indigo-900/30 transition hover:bg-indigo-50">
              Explore Colleges
            </a>
            <a href="/legacy" className="rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20">
              Network Legacy
            </a>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="h-10 w-px animate-pulse bg-white/30" />
        </div>
      </section>

      {/* Quick links grid */}
      <section id="home" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-500">What we offer</p>
          <h2 className="mt-3 text-center text-3xl font-extrabold text-slate-900 sm:text-4xl">The Full Ecosystem</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <a key={link.href} href={link.href}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-lg">
                <span className="text-3xl">{link.emoji}</span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700">{link.title}</h3>
                <p className="text-sm text-slate-500">{link.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const quickLinks = [
  { href: "/colleges", emoji: "🏛️", title: "IIIT Directory", desc: "Explore every IIIT — campus photos, clubs, alumni, placement data." },
  { href: "/events", emoji: "📅", title: "Events Desk", desc: "Upcoming and past events across IIIT campuses." },
  { href: "/placement", emoji: "💼", title: "Placements", desc: "Branch-wise placement stats for every IIIT." },
  { href: "/legacy", emoji: "🏆", title: "Network Legacy", desc: "Alumni profiles, past team members and student leaders." },
  { href: "/discuss", emoji: "💬", title: "Student Discuss", desc: "IIIT clubs posting announcements, events and collaborations." },
  { href: "/team", emoji: "👥", title: "Our Team", desc: "Meet the students building IIITians Network." },
];
