"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Eye,
  Instagram,
  Linkedin,
  Sparkles,
  Users,
} from "lucide-react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import { AdminHeader, AdminStatCard } from "@/components/admin/AdminHeader";
import { AdminCard, AdminCardHeader } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput } from "@/components/admin/AdminInput";

interface SiteStats {
  instagramFollowers: number;
  linkedinFollowers: number;
  overallReach: number;
  totalViews: number;
}

const initialForm: SiteStats = {
  instagramFollowers: 0,
  linkedinFollowers: 0,
  overallReach: 0,
  totalViews: 0,
};

const statMeta = [
  {
    key: "instagramFollowers" as keyof SiteStats,
    label: "Instagram Followers",
    icon: Instagram,
    color: "rose" as const,
    description: "Total Instagram followers across all accounts",
    placeholder: "e.g. 12500",
  },
  {
    key: "linkedinFollowers" as keyof SiteStats,
    label: "LinkedIn Followers",
    icon: Linkedin,
    color: "sky" as const,
    description: "Total LinkedIn page followers",
    placeholder: "e.g. 8400",
  },
  {
    key: "overallReach" as keyof SiteStats,
    label: "Overall Reach",
    icon: Users,
    color: "indigo" as const,
    description: "Combined cross-platform audience reach",
    placeholder: "e.g. 25000",
  },
  {
    key: "totalViews" as keyof SiteStats,
    label: "Total Views",
    icon: Eye,
    color: "emerald" as const,
    description: "Cumulative page and content views",
    placeholder: "e.g. 150000",
  },
];

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function AdminStatsPage() {
  const [form, setForm] = useState<SiteStats>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<SiteStats>("/site-stats");
      const data = response.data;
      setForm({
        instagramFollowers: Number(data.instagramFollowers) || 0,
        linkedinFollowers: Number(data.linkedinFollowers) || 0,
        overallReach: Number(data.overallReach) || 0,
        totalViews: Number(data.totalViews) || 0,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not load site stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.put("/site-stats", form);
      setSuccess("Network Reach Stats updated successfully.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not save site stats.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminCard padding="lg" className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </AdminCard>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminHeader
          title="Network Reach Stats"
          description="Manage the public-facing network reach numbers shown across the site — Instagram, LinkedIn, overall reach, and total views."
          badge="Site stats"
          badgeColor="indigo"
          backHref="/admin"
          icon={BarChart3}
          stats={
            <div className="grid grid-cols-2 gap-2">
              <AdminStatCard
                label="Total Reach"
                value={formatNumber(form.overallReach)}
                color="indigo"
              />
              <AdminStatCard
                label="Total Views"
                value={formatNumber(form.totalViews)}
                color="emerald"
              />
            </div>
          }
        />

        {(error || success) && (
          <div className="space-y-2">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-600">
                <Sparkles className="h-4 w-4 shrink-0" />
                {success}
              </div>
            )}
          </div>
        )}

        {/* Live preview cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statMeta.map(({ key, label, icon: Icon, color }) => (
            <div
              key={key}
              className={`flex flex-col gap-2 rounded-xl border p-4 shadow-sm transition
                ${color === "rose" ? "border-rose-100 bg-rose-50/60" : ""}
                ${color === "sky" ? "border-sky-100 bg-sky-50/60" : ""}
                ${color === "indigo" ? "border-indigo-100 bg-indigo-50/60" : ""}
                ${color === "emerald" ? "border-emerald-100 bg-emerald-50/60" : ""}
              `}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg
                  ${color === "rose" ? "bg-rose-100 text-rose-600" : ""}
                  ${color === "sky" ? "bg-sky-100 text-sky-600" : ""}
                  ${color === "indigo" ? "bg-indigo-100 text-indigo-600" : ""}
                  ${color === "emerald" ? "bg-emerald-100 text-emerald-600" : ""}
                `}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div
                  className={`text-xl font-bold sm:text-2xl
                    ${color === "rose" ? "text-rose-700" : ""}
                    ${color === "sky" ? "text-sky-700" : ""}
                    ${color === "indigo" ? "text-indigo-700" : ""}
                    ${color === "emerald" ? "text-emerald-700" : ""}
                  `}
                >
                  {formatNumber(form[key])}
                </div>
                <div className="mt-0.5 text-[11px] font-semibold text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit form */}
        <AdminCard>
          <form onSubmit={handleSave} className="space-y-5">
            <AdminCardHeader
              title="Edit Stats"
              description="Update the four network reach figures. Changes are reflected site-wide immediately after saving."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {statMeta.map(({ key, label, description, placeholder, icon: Icon }) => (
                <div key={key} className="flex flex-col gap-1">
                  <AdminInput
                    label={label}
                    type="number"
                    name={key}
                    value={form[key]}
                    onChange={handleChange}
                    min={0}
                    placeholder={placeholder}
                  />
                  <p className="text-[11px] font-medium text-slate-400">{description}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-1">
              <AdminButton type="submit" isLoading={saving}>
                Save changes
              </AdminButton>
              <AdminButton
                type="button"
                variant="outline"
                onClick={loadStats}
                disabled={saving}
              >
                Reload from server
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
