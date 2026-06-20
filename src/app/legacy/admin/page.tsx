"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  XCircle,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import { AdminHeader, AdminStatCard } from "@/components/admin/AdminHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/AdminInput";
import type { IAlumni } from "@/types";
import AdminActionModal from "@/components/admin/AdminActionModal";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function LegacyAdminPage() {
  const router = useRouter();
  const [alumni, setAlumni] = useState<IAlumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest"|"oldest"|"year-desc"|"year-asc"|"name-asc"|"name-desc">("newest");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState("");

  const [editEntryId, setEditEntryId] = useState("");
  const [editForm, setEditForm] = useState<any>({});
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"promote" | "copy">("copy");
  const [modalMemberId, setModalMemberId] = useState<string | undefined>(undefined);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<IAlumni[]>("/alumni/admin/requests", {
        params: { status: statusFilter, search },
      });
      setAlumni(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load legacy requests.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const timer = setTimeout(() => load(), 300);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const stats = useMemo(() => {
    const total = alumni.length;
    const pending = alumni.filter((a) => (a.status || "approved") === "pending").length;
    const approved = alumni.filter((a) => (a.status || "approved") === "approved").length;
    const rejected = alumni.filter((a) => (a.status || "approved") === "rejected").length;
    return { total, pending, approved, rejected };
  }, [alumni]);

  const sortedAlumni = useMemo(() => {
    const items = [...alumni];
    switch (sortBy) {
      case "oldest":
        return items.sort((a, b) => (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0));
      case "year-desc":
        return items.sort((a, b) => (b.graduationYear || 0) - (a.graduationYear || 0));
      case "year-asc":
        return items.sort((a, b) => (a.graduationYear || 0) - (b.graduationYear || 0));
      case "name-asc":
        return items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      case "name-desc":
        return items.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
      case "newest":
      default:
        return items.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
    }
  }, [alumni, sortBy]);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewProfile, setViewProfile] = useState<IAlumni | null>(null);

  const openView = (a: IAlumni) => { setViewProfile(a); setViewOpen(true); };

  const setStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    setBusyId(id);
    try {
      await api.patch(`/alumni/${id}/status`, { status });
      setSuccess(`Profile status updated to ${status}.`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile status.");
    } finally {
      setBusyId("");
    }
  };

  const deleteAlumni = async (id: string) => {
    if (!confirm("Delete this profile permanently?")) return;
    setBusyId(id);
    try {
      await api.delete(`/alumni/${id}`);
      setSuccess("Profile deleted successfully.");
      load();
    } catch (err: any) {
      setError("Failed to delete profile.");
    } finally {
      setBusyId("");
    }
  };

  const startEdit = (entry: IAlumni) => {
    setEditEntryId(entry._id);
    setEditForm({ ...entry, graduationYear: String(entry.graduationYear || "") });
  };

  const handleSaveEdit = async (id: string) => {
    setBusyId(id);
    try {
      await api.patch(`/alumni/admin/${id}`, { ...editForm, graduationYear: Number(editForm.graduationYear) });
      setSuccess("Profile details updated.");
      setEditEntryId("");
      load();
    } catch (err: any) {
      setError("Could not update profile.");
    } finally {
      setBusyId("");
    }
  };

  // Use AdminActionModal (copy) to add legacy profile to team/term instead of inline form

  return (
    <AdminLayout>
      <AdminHeader
        title="Legacy Directory Admin"
        description="Review submissions, update profile verification status, and manage the alumni directory."
        badge="Legacy Moderation"
        backHref="/admin"
        icon={ShieldCheck}
          stats={
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <AdminStatCard label="Total" value={stats.total} color="slate" />
            <AdminStatCard label="Pending" value={stats.pending} color="amber" />
            <AdminStatCard label="Approved" value={stats.approved} color="emerald" />
              <AdminStatCard label="Rejected" value={stats.rejected} color="rose" />
            </div>
          }
          actions={<AdminButton size="sm" icon={PlusCircle} onClick={() => router.push("/legacy#legacy-form")}>Add Profile</AdminButton>}
        />

      <AdminSectionTabs
        active={statusFilter}
        onChange={setStatusFilter}
        tabs={[
          { id: "all", label: "All", count: stats.total },
          { id: "pending", label: "Pending", icon: Clock3, count: stats.pending },
          { id: "approved", label: "Approved", icon: CheckCircle2, count: stats.approved },
          { id: "rejected", label: "Rejected", icon: XCircle, count: stats.rejected },
        ]}
      />

      <AdminCard className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, college, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-2.5 text-sm outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>
          <div className="ml-auto">
            <label className="block text-xs text-slate-500 mb-1">Sort</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded-full border bg-white px-3 py-1 text-sm">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="year-desc">Year (latest)</option>
              <option value="year-asc">Year (earliest)</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {(error || success) && (
        <div className="space-y-2 mb-6">
          {error && <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-600"><AlertCircle className="h-4 w-4"/> {error}</div>}
          {success && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4"/> {success}</div>}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>
      ) : (
        <div className="overflow-x-auto rounded-[1.2rem] border border-slate-200 bg-white shadow-sm">
          <div className="min-w-[980px]">
          <div className="grid grid-cols-[minmax(220px,1.35fr)_minmax(160px,0.9fr)_110px_120px_minmax(260px,1fr)] border-b border-slate-200 bg-slate-50/80 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            <div>Member</div>
            <div>Institute / Team</div>
            <div>Year</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          {sortedAlumni.map((a) => {
            const isEditing = editEntryId === a._id;
            return (
              <div key={a._id} className="border-b border-slate-100 px-5 py-4 last:border-b-0">
                {isEditing ? (
                  <div className="space-y-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="grid grid-cols-2 gap-3">
                      <AdminInput label="Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      <AdminInput label="Email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                      <AdminInput label="Institute" value={editForm.iiit} onChange={e => setEditForm({...editForm, iiit: e.target.value})} />
                      <AdminInput label="Generation" value={editForm.generation} onChange={e => setEditForm({...editForm, generation: e.target.value})} />
                      <AdminInput label="Grad Year" value={editForm.graduationYear} onChange={e => setEditForm({...editForm, graduationYear: e.target.value})} />
                      <AdminInput label="Branch" value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})} />
                    </div>
                    <AdminTextarea label="Bio" value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} rows={2} />
                    <AdminTextarea label="Admin Contribution Note" value={editForm.contribution} onChange={e => setEditForm({...editForm, contribution: e.target.value})} rows={2} />
                    <div className="flex gap-2">
                      <AdminButton icon={Pencil} onClick={() => handleSaveEdit(a._id)}>Save</AdminButton>
                      <AdminButton variant="ghost" onClick={() => setEditEntryId("")}>Cancel</AdminButton>
                    </div>
                  </div>
                ) : (
                  <div className="grid items-center gap-4 md:grid-cols-[minmax(220px,1.35fr)_minmax(160px,0.9fr)_110px_120px_minmax(260px,1fr)]">
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-900">{a.name}</h3>
                        <p className="text-xs text-slate-500">{a.email}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{a.networkPost || a.currentRole || "Legacy Member"}</div>
                      <div className="text-xs text-slate-500">{a.iiit}</div>
                    </div>
                    <div>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100">
                        {a.generation || a.graduationYear || "-"}
                      </span>
                    </div>
                    <div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ${a.status === 'approved' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : a.status === 'rejected' ? 'bg-rose-50 text-rose-700 ring-rose-100' : 'bg-amber-50 text-amber-700 ring-amber-100'}`}>
                        {a.status || 'approved'}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                      <AdminButton size="sm" variant="outline" icon={Pencil} onClick={() => startEdit(a)}>Edit</AdminButton>
                      <AdminButton size="sm" variant="outline" icon={PlusCircle} onClick={() => { setModalAction("copy"); setModalMemberId(a._id); setModalOpen(true); }}>Team</AdminButton>
                      <AdminButton size="sm" variant="ghost" icon={Search} onClick={() => openView(a)}>View</AdminButton>
                      {a.status !== 'approved' && <AdminButton size="sm" variant="secondary" icon={CheckCircle2} onClick={() => setStatus(a._id, 'approved')}>Approve</AdminButton>}
                      {a.status !== 'rejected' && <AdminButton size="sm" variant="danger" icon={XCircle} onClick={() => setStatus(a._id, 'rejected')}>Reject</AdminButton>}
                      <AdminButton size="sm" variant="ghost" icon={Trash2} onClick={() => deleteAlumni(a._id)} className="ml-auto text-rose-500 hover:text-rose-600 hover:bg-rose-50" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {alumni.length === 0 && <div className="py-8 text-center text-slate-500">No legacy profiles found.</div>}
          </div>
        </div>
      )}

          <AdminActionModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            action={modalAction}
            memberId={modalMemberId}
            onSuccess={() => { setModalOpen(false); load(); setSuccess("Action completed."); }}
          />
          {viewOpen && viewProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{viewProfile.name}</h3>
                  <div className="text-sm text-slate-500">{viewProfile.email}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Institute</p>
                    <div className="font-medium">{viewProfile.iiit || '—'}</div>
                    <p className="text-sm text-slate-600 mt-2">Generation</p>
                    <div className="font-medium">{viewProfile.generation || '—'}</div>
                    <p className="text-sm text-slate-600 mt-2">Graduation Year</p>
                    <div className="font-medium">{viewProfile.graduationYear || '—'}</div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Branch</p>
                    <div className="font-medium">{viewProfile.branch || '—'}</div>
                    <p className="text-sm text-slate-600 mt-2">Current Role</p>
                    <div className="font-medium">{viewProfile.currentRole || '—'}</div>
                    <p className="text-sm text-slate-600 mt-2">Company</p>
                    <div className="font-medium">{viewProfile.currentCompany || '—'}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-slate-600">Bio</p>
                  <div className="p-3 rounded border bg-slate-50 text-sm text-slate-700">{viewProfile.bio || '—'}</div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={() => { setViewOpen(false); setViewProfile(null); }} className="rounded px-3 py-2 border">Close</button>
                </div>
              </div>
            </div>
          )}
        </AdminLayout>
  );
}
