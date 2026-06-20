"use client";

import { useEffect, useState } from "react";
import { Building2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { ICollege, ITeamMember } from "@/types";

// Import modular subcomponents
import StatusMessage from "@/components/colleges/StatusMessage";
import MetricCard from "@/components/colleges/MetricCard";
import CreateCollegeSection from "@/components/colleges/CreateCollegeSection";
import EditCollegeSection from "@/components/colleges/EditCollegeSection";

export default function CollegesAdmin() {
  const router = useRouter();
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [teamMembers, setTeamMembers] = useState<ITeamMember[]>([]);
  const [collegeLoading, setCollegeLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCollegeData = async () => {
    setCollegeLoading(true);
    setError("");
    const requestNonce = Date.now();

    try {
      const [collegesResponse, teamResponse] = await Promise.all([
        api.get<ICollege[]>("/colleges", {
          params: { _: requestNonce },
          headers: { "Cache-Control": "no-cache" },
        }),
        api.get<ITeamMember[]>("/team"),
      ]);

      setColleges(collegesResponse.data || []);
      setTeamMembers(teamResponse.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not load colleges.");
    } finally {
      setCollegeLoading(false);
    }
  };

  useEffect(() => {
    loadCollegeData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-indigo-100 bg-white/80 text-indigo-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-indigo-700 hover:shadow-md active:scale-95"
                >
                  <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
                </button>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-700">
                  <Building2 className="h-4 w-4" />
                  Colleges Workspace
                </div>
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Manage Colleges
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 font-semibold leading-relaxed">
                Keep each institute ready with a card photo, a reusable logo, useful links, and up-to-date network presence.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Colleges" value={colleges.length} />
              <MetricCard
                label="With photos"
                value={
                  colleges.filter(
                    (c) => c.photo?.url || (c.gallery?.length || 0) > 0 || c.logo?.url
                  ).length
                }
              />
              <MetricCard label="With logos" value={colleges.filter((c) => c.logo?.url).length} />
            </div>
          </div>
        </section>

        {error && <StatusMessage tone="error">{error}</StatusMessage>}

        {/* Add College Section */}
        <CreateCollegeSection onSuccess={loadCollegeData} />

        {/* Edit College Section */}
        <EditCollegeSection
          colleges={colleges}
          collegeLoading={collegeLoading}
          teamMembers={teamMembers}
          onSuccess={loadCollegeData}
        />
      </div>
    </AdminLayout>
  );
}
