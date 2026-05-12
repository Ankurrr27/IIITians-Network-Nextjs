"use client";
import type { Metadata } from "next";
export default function GuidePage() {
  return (
    <main className="relative min-h-screen bg-white pb-20 pt-24">
      <div className="mx-auto max-w-4xl px-6">
        <header className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-500">User Guide</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">How to Use IIITians Network</h1>
          <p className="mt-3 text-slate-500">Everything you need to know about the platform — from exploring colleges to joining the team.</p>
        </header>
        <div className="space-y-8">
          {guides.map((g) => (
            <section key={g.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <h2 className="text-base font-bold text-slate-900">{g.emoji} {g.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{g.content}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

const guides = [
  { emoji: "🏛️", title: "IIIT Directory", content: "Browse all IIITs using the Colleges page. Use search and filters to find specific institutions. Click on a college card to see its gallery, club links and more." },
  { emoji: "📅", title: "Events Desk", content: "See upcoming and past events posted by clubs across all campuses. Events are sorted chronologically — filter by college or search by name." },
  { emoji: "💼", title: "Placement Data", content: "View branch-wise placement stats for each IIIT. Data is organized yearly and includes highest, average, and lowest packages." },
  { emoji: "🏆", title: "Network Legacy", content: "Explore profiles of alumni and past team members. You can submit your own profile for admin review through the Add Your Profile button." },
  { emoji: "💬", title: "Student Discuss", content: "Read posts from verified IIIT clubs — announcements, events, collaborations. Clubs can register for an account to post." },
  { emoji: "👥", title: "Our Team", content: "Meet the current team driving the network. Filter by team division and batch year. Interested in joining? Click Join the Team." },
];
