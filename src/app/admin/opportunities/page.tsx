"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Trash2,
  XCircle,
  ShieldCheck,
  AlertCircle,
  Search,
  Briefcase,
  Building2,
  MapPin,
  ExternalLink,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import { AdminHeader, AdminStatCard } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";

interface OpportunityListing {
  _id: string;
  title: string;
  company: string;
  category: string;
  location: string;
  workMode: string;
  compensation: string;
  deadline: string;
  description: string;
  skills: string[];
  applicationLink: string;
  recruiterEmail: string;
  recruiterLinkedIn?: string;
  recruiterVerified: boolean;
  companyVerified: boolean;
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function OpportunitiesAdminPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<OpportunityListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "company">("newest");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState("");

  const [selectedOpp, setSelectedOpp] = useState<OpportunityListing | null>(null);

  const loadListings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<OpportunityListing[]>("/admin/opportunities");
      setOpportunities(res.data || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load opportunity listings for moderation."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const stats = useMemo(() => {
    const total = opportunities.length;
    const pending = opportunities.filter((o) => o.status === "pending").length;
    const approved = opportunities.filter((o) => o.status === "approved").length;
    const rejected = opportunities.filter((o) => o.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [opportunities]);

  const filteredAndSortedListings = useMemo(() => {
    let list = [...opportunities];

    // Status Filter
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }

    // Search query match
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(query) ||
          o.company.toLowerCase().includes(query) ||
          o.description.toLowerCase().includes(query) ||
          o.recruiterEmail.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "oldest":
        return list.sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        );
      case "title":
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case "company":
        return list.sort((a, b) => a.company.localeCompare(b.company));
      case "newest":
      default:
        return list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
    }
  }, [opportunities, statusFilter, searchQuery, sortBy]);

  const handleUpdateModeration = async (
    id: string,
    updates: Partial<OpportunityListing>
  ) => {
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      const res = await api.patch(`/admin/opportunities/${id}`, updates);
      setSuccess(`Opportunity status successfully updated.`);
      if (selectedOpp && selectedOpp._id === id) {
        setSelectedOpp(res.data);
      }
      loadListings();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update opportunity moderation state.");
    } finally {
      setBusyId("");
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you absolutely sure you want to delete this listing permanently?")) return;
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/admin/opportunities/${id}`);
      setSuccess("Opportunity listing permanently deleted.");
      setSelectedOpp(null);
      loadListings();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete opportunity listing.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <AdminLayout>
      <AdminHeader
        title="Opportunities Moderation"
        description="Review recruiter job postings, verify recruiter profiles, and manage the talent marketplace."
        badge="Opportunities Gate"
        backHref="/admin"
        icon={Briefcase}
        stats={
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <AdminStatCard label="Total Submissions" value={stats.total} color="slate" />
            <AdminStatCard label="Pending Review" value={stats.pending} color="amber" />
            <AdminStatCard label="Approved Jobs" value={stats.approved} color="emerald" />
            <AdminStatCard label="Rejected Jobs" value={stats.rejected} color="rose" />
          </div>
        }
        actions={
          <AdminButton size="sm" icon={PlusCircle} onClick={() => router.push("/opportunities?post=true")}>
            Post Opportunity
          </AdminButton>
        }
      />

      <AdminSectionTabs
        active={statusFilter}
        onChange={setStatusFilter}
        tabs={[
          { id: "all", label: "All Listings", count: stats.total },
          { id: "pending", label: "Pending Vetting", icon: Clock3, count: stats.pending },
          { id: "approved", label: "Approved Live", icon: CheckCircle2, count: stats.approved },
          { id: "rejected", label: "Rejected", icon: XCircle, count: stats.rejected },
        ]}
      />

      <AdminCard className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full max-w-lg">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title, company, recruiter email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-10 py-2.5 text-xs font-semibold outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-400">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-full border bg-white px-4 py-1.5 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A–Z</option>
              <option value="company">Company A–Z</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {(error || success) && (
        <div className="space-y-2 mb-6">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs font-bold text-rose-600 border border-rose-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-bold text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[1.2rem] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs text-slate-600">
            <thead className="bg-slate-55/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Opportunity</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Recruiter Information</th>
                <th className="px-6 py-4">Status & Flags</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredAndSortedListings.map((opp) => (
                <tr key={opp._id} className="hover:bg-slate-50/50 transition duration-150">
                  <td className="px-6 py-4.5">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{opp.title}</h4>
                      <p className="text-slate-400 font-semibold mt-0.5">{opp.company}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="space-y-1 text-[11px] font-medium">
                      <div className="flex items-center gap-1">
                        <span className="rounded bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700">
                          {opp.category}
                        </span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
                          {opp.workMode}
                        </span>
                      </div>
                      <div className="text-slate-450 mt-1">{opp.location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="space-y-0.5 text-[11px]">
                      <div className="font-bold text-slate-700">{opp.recruiterEmail}</div>
                      {opp.recruiterLinkedIn && (
                        <a
                          href={opp.recruiterLinkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-indigo-500 hover:underline"
                        >
                          LinkedIn <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase w-max tracking-wider border ${
                          opp.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : opp.status === "rejected"
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {opp.status}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {opp.recruiterVerified && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1 py-0.5 text-[8.5px] font-extrabold text-emerald-700 uppercase border border-emerald-150">
                            Verified Recruiter
                          </span>
                        )}
                        {opp.companyVerified && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1 py-0.5 text-[8.5px] font-extrabold text-emerald-700 uppercase border border-emerald-150">
                            Verified Company
                          </span>
                        )}
                        {opp.featured && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 px-1 py-0.5 text-[8.5px] font-extrabold text-indigo-700 uppercase border border-indigo-150">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <AdminButton size="sm" variant="outline" onClick={() => setSelectedOpp(opp)}>
                        View Details
                      </AdminButton>
                      
                      {opp.status !== "approved" && (
                        <AdminButton
                          size="sm"
                          variant="secondary"
                          icon={CheckCircle2}
                          onClick={() => handleUpdateModeration(opp._id, { status: "approved" })}
                          disabled={busyId === opp._id}
                        >
                          Approve
                        </AdminButton>
                      )}

                      {opp.status !== "rejected" && (
                        <AdminButton
                          size="sm"
                          variant="danger"
                          icon={XCircle}
                          onClick={() => handleUpdateModeration(opp._id, { status: "rejected" })}
                          disabled={busyId === opp._id}
                        >
                          Reject
                        </AdminButton>
                      )}

                      <AdminButton
                        size="sm"
                        variant="ghost"
                        icon={Trash2}
                        onClick={() => handleDeleteListing(opp._id)}
                        disabled={busyId === opp._id}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50/50"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAndSortedListings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                    No opportunity listings found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Moderation Details Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl overflow-y-auto max-h-[85vh] text-slate-800">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  Opportunity Vetting Panel
                </span>
                <h3 className="text-lg font-black text-slate-900 leading-tight mt-0.5">
                  {selectedOpp.title}
                </h3>
                <p className="text-slate-450 font-bold text-xs mt-0.5">{selectedOpp.company}</p>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                className="rounded-full p-1.5 hover:bg-slate-100 transition text-slate-400 hover:text-slate-650"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Category</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedOpp.category}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Work Mode & Location</p>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedOpp.workMode} &middot; {selectedOpp.location}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Stipend / Compensation</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedOpp.compensation || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Application Link / Email</p>
                  <a
                    href={
                      selectedOpp.applicationLink.startsWith("http")
                        ? selectedOpp.applicationLink
                        : `mailto:${selectedOpp.applicationLink}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-indigo-600 hover:underline mt-0.5 inline-flex items-center gap-1"
                  >
                    {selectedOpp.applicationLink} <ExternalLink size={11} />
                  </a>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Recruiter Work Email</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedOpp.recruiterEmail}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Recruiter LinkedIn</p>
                  {selectedOpp.recruiterLinkedIn ? (
                    <a
                      href={selectedOpp.recruiterLinkedIn}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-indigo-600 hover:underline mt-0.5 inline-flex items-center gap-1"
                    >
                      {selectedOpp.recruiterLinkedIn} <ExternalLink size={11} />
                    </a>
                  ) : (
                    <p className="text-slate-400 italic mt-0.5">Not provided</p>
                  )}
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Application Deadline</p>
                  <p className="font-bold text-slate-850 mt-0.5">{selectedOpp.deadline || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Skills Required</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedOpp.skills.map((s, i) => (
                      <span key={i} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {s}
                      </span>
                    ))}
                    {selectedOpp.skills.length === 0 && <span className="text-slate-400 italic">None</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-slate-400 text-[10px] font-bold uppercase">Description & Requirements</p>
              <div className="mt-1.5 p-3 rounded-xl border border-slate-150 bg-slate-50/50 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {selectedOpp.description}
              </div>
            </div>

            <div className="mt-5 border-t pt-4">
              <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Verification Controls</p>
              <div className="flex flex-wrap gap-2.5">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 hover:bg-slate-50 cursor-pointer select-none text-xs font-bold text-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={selectedOpp.recruiterVerified}
                    onChange={(e) =>
                      handleUpdateModeration(selectedOpp._id, { recruiterVerified: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Verify Recruiter Profile
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 hover:bg-slate-50 cursor-pointer select-none text-xs font-bold text-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={selectedOpp.companyVerified}
                    onChange={(e) =>
                      handleUpdateModeration(selectedOpp._id, { companyVerified: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Verify Company Entity
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 hover:bg-slate-50 cursor-pointer select-none text-xs font-bold text-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={selectedOpp.featured}
                    onChange={(e) =>
                      handleUpdateModeration(selectedOpp._id, { featured: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Mark as Featured Listing
                </label>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex flex-wrap justify-between gap-3">
              <AdminButton
                variant="danger"
                icon={Trash2}
                onClick={() => handleDeleteListing(selectedOpp._id)}
                disabled={busyId === selectedOpp._id}
              >
                Delete Permanently
              </AdminButton>
              
              <div className="flex gap-2">
                {selectedOpp.status !== "rejected" && (
                  <AdminButton
                    variant="ghost"
                    icon={XCircle}
                    onClick={() => handleUpdateModeration(selectedOpp._id, { status: "rejected" })}
                    disabled={busyId === selectedOpp._id}
                    className="text-rose-600 border border-rose-200"
                  >
                    Reject Post
                  </AdminButton>
                )}
                {selectedOpp.status !== "approved" && (
                  <AdminButton
                    variant="secondary"
                    icon={CheckCircle2}
                    onClick={() => handleUpdateModeration(selectedOpp._id, { status: "approved" })}
                    disabled={busyId === selectedOpp._id}
                  >
                    Approve & Publish
                  </AdminButton>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="rounded-xl border px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
