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

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function LegacyAdminPage() {
  const router = useRouter();
  const [alumni, setAlumni] = useState<IAlumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState("");

  const [editEntryId, setEditEntryId] = useState("");
  const [editForm, setEditForm] = useState<any>({});
  
  const [teamEntryId, setTeamEntryId] = useState("");
  const [teamForm, setTeamForm] = useState<any>({});

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

  const startAddToTeam = (entry: IAlumni) => {
    setTeamEntryId(entry._id);
    setTeamForm({
      name: entry.name || "",
      role: entry.networkPost || entry.currentRole || "",
      roleType: "MEMBER",
      iiit: entry.iiit || "",
      email: entry.email || "",
      team: "Core",
      year: entry.generation || new Date().getFullYear().toString(),
      order: 0,
    });
  };

  const handleAddToTeam = async (entry: IAlumni) => {
    setBusyId(entry._id);
    try {
      const formData = new FormData();
      Object.entries(teamForm).forEach(([key, value]) => formData.append(key, String(value)));
      if (entry.photo?.url) formData.append("photoSourceAlumniId", entry._id);
      await api.post("/team", formData);
      setSuccess(`Added ${entry.name} to the team history.`);
      setTeamEntryId("");
    } catch (err: any) {
      setError("Could not add legacy profile to team.");
    } finally {
      setBusyId("");
    }
  };

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
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
            {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition whitespace-nowrap ${
                  statusFilter === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
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
        <div className="grid gap-4 lg:grid-cols-2">
          {alumni.map((a) => {
            const isEditing = editEntryId === a._id;
            const isAdding = teamEntryId === a._id;
            return (
              <AdminCard key={a._id} className="flex flex-col h-full">
                {isEditing ? (
                  <div className="space-y-4">
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
                ) : isAdding ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold">Add to Team History</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <AdminInput label="Name" value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} />
                      <AdminInput label="Role" value={teamForm.role} onChange={e => setTeamForm({...teamForm, role: e.target.value})} />
                      <AdminSelect label="Role Type" value={teamForm.roleType} onChange={e => setTeamForm({...teamForm, roleType: e.target.value})} options={[{label:"Exec",value:"EXEC"},{label:"Lead",value:"LEAD"},{label:"Member",value:"MEMBER"}]} />
                      <AdminSelect label="Team" value={teamForm.team} onChange={e => setTeamForm({...teamForm, team: e.target.value})} options={[{label:"Core",value:"Core"},{label:"Tech",value:"Tech"}]} />
                      <AdminInput label="Term Year" value={teamForm.year} onChange={e => setTeamForm({...teamForm, year: e.target.value})} />
                      <AdminInput label="Order" type="number" value={teamForm.order} onChange={e => setTeamForm({...teamForm, order: e.target.value})} />
                    </div>
                    <div className="flex gap-2">
                      <AdminButton icon={PlusCircle} onClick={() => handleAddToTeam(a)}>Confirm Add</AdminButton>
                      <AdminButton variant="ghost" onClick={() => setTeamEntryId("")}>Cancel</AdminButton>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900">{a.name}</h3>
                        <p className="text-xs text-slate-500">{a.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${a.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : a.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {a.status || 'approved'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2 mb-4">
                      <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-semibold">{a.iiit}</span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-semibold">{a.generation}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100">
                      <AdminButton size="sm" variant="outline" icon={Pencil} onClick={() => startEdit(a)}>Edit</AdminButton>
                      <AdminButton size="sm" variant="outline" icon={PlusCircle} onClick={() => startAddToTeam(a)}>Team</AdminButton>
                      {a.status !== 'approved' && <AdminButton size="sm" variant="secondary" icon={CheckCircle2} onClick={() => setStatus(a._id, 'approved')}>Approve</AdminButton>}
                      {a.status !== 'rejected' && <AdminButton size="sm" variant="danger" icon={XCircle} onClick={() => setStatus(a._id, 'rejected')}>Reject</AdminButton>}
                      <AdminButton size="sm" variant="ghost" icon={Trash2} onClick={() => deleteAlumni(a._id)} className="ml-auto text-rose-500 hover:text-rose-600 hover:bg-rose-50" />
                    </div>
                  </>
                )}
              </AdminCard>
            )
          })}
          {alumni.length === 0 && <div className="col-span-2 py-8 text-center text-slate-500">No legacy profiles found.</div>}
        </div>
      )}
    </AdminLayout>
  );
}
