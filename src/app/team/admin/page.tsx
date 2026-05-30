"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import { AdminHeader, AdminStatCard } from "@/components/admin/AdminHeader";
import { AdminCard, AdminCardHeader } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/AdminInput";
import { AdminTable, AdminTableHeader, AdminTh, AdminTableBody, AdminTableRow, AdminTd, AdminBadge } from "@/components/admin/AdminTable";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import type { ITeamMember } from "@/types";
import { Plus, Trash2, Pencil, Users, AlertCircle, CheckCircle2, Copy, TrendingUp, Search } from "lucide-react";
import AdminActionModal from "@/components/admin/AdminActionModal";

export default function TeamAdminPage() {
  const [members, setMembers] = useState<ITeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"team" | "copy" | "promote">("team");

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Clone Term State
  const [cloneForm, setCloneForm] = useState({ sourceTermId: "", newTermName: "", startDate: "", endDate: "" });
  
  // Bulk Promote State
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [promoteForm, setPromoteForm] = useState({ newRoleId: "", reason: "" });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"promote" | "copy">("promote");
  const [modalMemberId, setModalMemberId] = useState<string | undefined>(undefined);
  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get<ITeamMember[]>("/team");
      setMembers(res.data || []);
    } catch (err: any) {
      setError("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadMembers(); }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(m => !query || m.name?.toLowerCase().includes(query.toLowerCase()) || m.email?.toLowerCase().includes(query.toLowerCase()));
  }, [members, query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (photoFile) fd.append("photo", photoFile);

      if (editId) {
        await api.put(`/team/${editId}`, fd);
        setSuccess("Team member updated.");
      } else {
        await api.post("/team", fd);
        setSuccess("New team member added.");
      }
      setShowForm(false);
      loadMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save team member details.");
    }
  };

  const handleCloneTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real scenario, sourceTermId would come from an API. For now we assume the user knows it, or we just pass a string term name and the backend handles it.
      await api.post("/team/terms/clone", cloneForm);
      setSuccess("Term cloned successfully.");
      setCloneForm({ sourceTermId: "", newTermName: "", startDate: "", endDate: "" });
      loadMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to clone term.");
    }
  };

  const handleBulkPromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPromotions.length === 0) return setError("Select members to promote.");
    try {
      const promotions = selectedPromotions.map(id => ({ tenureId: id, newRoleId: promoteForm.newRoleId, reason: promoteForm.reason }));
      await api.post("/team/promote/bulk", { promotions });
      setSuccess("Bulk promotion successful.");
      setSelectedPromotions([]);
      loadMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to promote.");
    }
  };

  const openAdd = () => {
    setForm({ name: "", email: "", role: "Member", roleType: "MEMBER", team: "Core", year: new Date().getFullYear().toString(), iiit: "" });
    setEditId(null);
    setPhotoFile(null);
    setShowForm(true);
  };

  if (loading) {
    return <AdminLayout><div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminHeader
          title="Team Management"
          description="Manage active team members, copy teams from previous years, and promote members."
          badge="Team Settings"
          icon={Users}
          stats={
            <div className="flex gap-2">
              <AdminStatCard label="Total Active" value={members.length} color="indigo" />
            </div>
          }
          actions={<AdminButton size="sm" onClick={openAdd} icon={Plus}>Add Member</AdminButton>}
        />

        <AdminSectionTabs
          active={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "team", label: "Active Team", icon: Users, count: members.length },
            { id: "copy", label: "Copy Previous Team", icon: Copy },
            { id: "promote", label: "Promote Members", icon: TrendingUp },
          ]}
        />

        {(error || success) && (
          <div className="space-y-2 mb-4">
            {error && <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-600"><AlertCircle className="h-4 w-4"/> {error}</div>}
            {success && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4"/> {success}</div>}
          </div>
        )}

        {activeTab === "team" && (
          <>
            <AdminCard className="mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search team members..." value={query} onChange={e => setQuery(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-2.5 text-sm outline-none focus:border-indigo-600" />
                </div>
              </div>
            </AdminCard>

            <AdminTable>
              <AdminTableHeader>
                <AdminTh>Member</AdminTh>
                <AdminTh>Role / Team</AdminTh>
                <AdminTh>Year</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Actions</AdminTh>
              </AdminTableHeader>
              <AdminTableBody>
                {filteredMembers.map((m) => (
                  <AdminTableRow key={m._id}>
                    <AdminTd>
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-xs text-slate-500">{m.email}</div>
                    </AdminTd>
                    <AdminTd>
                      <div className="font-semibold text-slate-900">{m.role}</div>
                      <div className="text-xs text-slate-500">{m.team}</div>
                    </AdminTd>
                    <AdminTd><AdminBadge color="indigo">{m.year}</AdminBadge></AdminTd>
                    <AdminTd><AdminBadge color={m.isActive ? "emerald" : "slate"}>{m.isActive ? "Active" : "Archived"}</AdminBadge></AdminTd>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          </>
        )}

        {activeTab === "copy" && (
          <AdminCard>
            <AdminCardHeader title="Copy Previous Year Team" description="Copy all active members from a previous year into a new year to prepare for the new academic session." />
            <form onSubmit={handleCloneTerm} className="space-y-4 max-w-lg">
              <AdminInput label="Source Year ID (ObjectId)" required value={cloneForm.sourceTermId} onChange={e => setCloneForm({...cloneForm, sourceTermId: e.target.value})} placeholder="e.g. 64b..." />
              <AdminInput label="New Year Name" required value={cloneForm.newTermName} onChange={e => setCloneForm({...cloneForm, newTermName: e.target.value})} placeholder="e.g. 2026-27" />
              <AdminInput type="date" label="Start Date" required value={cloneForm.startDate} onChange={e => setCloneForm({...cloneForm, startDate: e.target.value})} />
              <AdminInput type="date" label="End Date" required value={cloneForm.endDate} onChange={e => setCloneForm({...cloneForm, endDate: e.target.value})} />
              <AdminButton type="submit" icon={Copy}>Copy Team</AdminButton>
            </form>
          </AdminCard>
        )}

        {activeTab === "promote" && (
          <AdminCard>
            <AdminCardHeader title="Promote Members" description="Select multiple active members to promote them to a new role." />
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-slate-700">Select Members ({selectedPromotions.length} selected)</h4>
                <div className="max-h-[400px] overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 custom-scrollbar">
                  {members.map((m) => (
                    <label key={m._id} className="flex items-center p-3 hover:bg-slate-50 cursor-pointer gap-3">
                      <input type="checkbox" checked={selectedPromotions.includes(m._id)} onChange={(e) => {
                        if (e.target.checked) setSelectedPromotions(p => [...p, m._id]);
                        else setSelectedPromotions(p => p.filter(id => id !== m._id));
                      }} className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{m.name}</div>
                        <div className="text-xs text-slate-500">{m.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" title="Promote" onClick={() => { setModalAction("promote"); setModalMemberId(m._id); setModalOpen(true); }} className="rounded px-2 py-1 text-xs bg-amber-50 text-amber-600">Promote</button>
                        <button type="button" title="Copy to Term" onClick={() => { setModalAction("copy"); setModalMemberId(m._id); setModalOpen(true); }} className="rounded px-2 py-1 text-xs bg-sky-50 text-sky-600">Copy</button>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
                <div className="w-full sm:w-80">
                  <form onSubmit={handleBulkPromote} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <AdminInput label="Target Role ID (ObjectId)" required value={promoteForm.newRoleId} onChange={e => setPromoteForm({...promoteForm, newRoleId: e.target.value})} placeholder="e.g. 64b..." />
                    <AdminTextarea label="Reason (optional)" value={promoteForm.reason} onChange={e => setPromoteForm({...promoteForm, reason: e.target.value})} placeholder="Promotion reason or note" />
                    <AdminButton type="submit">Promote Selected</AdminButton>
                  </form>
                </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <form onSubmit={handleSubmit} className="my-8 w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg text-slate-900 mb-4">{editId ? "Edit Member" : "New Team Member"}</h3>
              <div className="grid grid-cols-2 gap-3">
                <AdminInput label="Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <AdminInput label="Email" required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <AdminInput label="Institute" required value={form.iiit} onChange={e => setForm({...form, iiit: e.target.value})} />
                <AdminInput label="Term Year" required value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
                <AdminSelect label="Role Type" value={form.roleType} onChange={e => setForm({...form, roleType: e.target.value})} options={[{label:"Member",value:"MEMBER"},{label:"Lead",value:"LEAD"},{label:"Exec",value:"EXEC"}]} />
                <AdminInput label="Role Title" required value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
                <div className="col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Photo (Required for new)</label>
                  <input type="file" onChange={e => setPhotoFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <AdminButton type="submit">Save</AdminButton>
                <AdminButton variant="ghost" onClick={() => setShowForm(false)}>Cancel</AdminButton>
              </div>
            </form>
          </div>
        )}
            </div>
          </AdminCard>
        )}
      </div>
      <AdminActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        action={modalAction}
        memberId={modalMemberId}
        onSuccess={() => { setModalOpen(false); loadMembers(); setSuccess("Action completed."); }}
      />
    </AdminLayout>
  );
}
