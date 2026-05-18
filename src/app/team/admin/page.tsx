"use client";
import { useEffect, useState } from "react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { ITeamMember } from "@/types";
import { Plus, Trash2, Pencil, X, Upload, ToggleLeft, ToggleRight } from "lucide-react";
import Image from "next/image";
import TeamMemberCard from "@/components/team/TeamMemberCard";

interface MemberForm {
  name: string; role: string; roleType: "EXEC" | "LEAD" | "MEMBER";
  iiit: string; email: string; team: string; year: string;
  linkedin: string; instagram: string; twitter: string;
  aboutText: string; isActive: boolean; order: number;
}

const EMPTY: MemberForm = {
  name: "", role: "", roleType: "MEMBER", iiit: "", email: "",
  team: "Core", year: new Date().getFullYear().toString(),
  linkedin: "", instagram: "", twitter: "", aboutText: "", isActive: true, order: 0,
};

const TEAMS = ["Core", "Tech", "Development", "Design", "Content", "Social Media"];

export default function TeamAdminPage() {
  const [members, setMembers] = useState<ITeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/team");
      setMembers(res.data);
    } finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setPhotoFile(null); setShowForm(true); };
  const openEdit = (m: ITeamMember) => {
    setForm({
      name: m.name, role: m.role, roleType: m.roleType, iiit: m.iiit, email: m.email,
      team: m.team, year: m.year, linkedin: m.linkedin || "", instagram: m.instagram || "",
      twitter: m.twitter || "", aboutText: m.aboutText || "", isActive: m.isActive ?? true, order: m.order ?? 0,
    });
    setEditId(m._id);
    setPhotoFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (photoFile) fd.append("photo", photoFile);

      if (editId) await api.patch(`/team/${editId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      else await api.post("/team", fd, { headers: { "Content-Type": "multipart/form-data" } });

      setShowForm(false);
      load();
    } catch { alert("Failed to save member."); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team member?")) return;
    await api.delete(`/team/${id}`);
    load();
  };

  const filtered = filter === "All" ? members : members.filter((m) => m.team === filter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Team Management</h2>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Add Member
          </button>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {["All", ...TEAMS].map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${filter === t ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-indigo-50"}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((m) => (
              <TeamMemberCard key={m._id} member={m} onEdit={openEdit} onDelete={handleDelete} />
            ))}
            {filtered.length === 0 && <p className="col-span-4 py-10 text-center text-sm text-slate-400">No members.</p>}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <form onSubmit={handleSubmit} className="my-8 w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">{editId ? "Edit Member" : "Add Member"}</h3>
                <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(["name", "role", "iiit", "email", "year"] as const).map((f) => (
                  <div key={f} className={f === "name" || f === "email" ? "col-span-2" : ""}>
                    <label className="mb-1 block text-xs font-semibold capitalize text-slate-600">{f}</label>
                    <input type={f === "email" ? "email" : "text"} required={["name", "role", "iiit", "email", "year"].includes(f)}
                      value={(form as unknown as Record<string, string | boolean | number>)[f] as string}

                      onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                ))}

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Role Type</label>
                  <select value={form.roleType} onChange={(e) => setForm({ ...form, roleType: e.target.value as MemberForm["roleType"] })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300">
                    <option>EXEC</option><option>LEAD</option><option>MEMBER</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Team</label>
                  <select value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300">
                    {TEAMS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {(["linkedin", "instagram", "twitter", "aboutText"] as const).map((f) => (
                <div key={f}>
                  <label className="mb-1 block text-xs font-semibold capitalize text-slate-600">{f}</label>
                  <input type="text" value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              ))}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600"><Upload className="inline h-3 w-3 mr-1" />Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs" />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                  Active member
                </label>
                <div className="ml-auto">
                  <label className="mr-2 text-xs font-semibold text-slate-600">Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none" />
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60">
                {saving ? "Saving…" : editId ? "Update Member" : "Add Member"}
              </button>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
