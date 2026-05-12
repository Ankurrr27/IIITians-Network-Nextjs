"use client";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";

export default function AdminGuidePage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Platform Guide (Admin View)</h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Full Platform Guide</p>
              <p className="text-sm text-slate-500">View the complete guide including the admin-specific sections.</p>
            </div>
          </div>
          <Link href="/guide" target="_blank" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <ExternalLink className="h-4 w-4" /> Open Guide
          </Link>
        </div>

        {/* Quick admin links */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 font-semibold text-slate-800">Quick Admin Actions</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Manage Colleges", href: "/colleges/admin" },
              { label: "Manage Events", href: "/events/admin" },
              { label: "Manage Legacy", href: "/legacy/admin" },
              { label: "Manage Team", href: "/team/admin" },
              { label: "Manage Placements", href: "/placement/admin" },
              { label: "Manage Discuss", href: "/discuss/admin" },
              { label: "Gallery Manager", href: "/admin/gallery" },
              { label: "Push Notification", href: "/admin/notifications" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                {item.label}
                <ExternalLink className="h-3.5 w-3.5 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
