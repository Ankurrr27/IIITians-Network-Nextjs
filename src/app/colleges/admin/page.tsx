"use client";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { ICollege } from "@/types";
import { Plus, Trash2, Pencil, Image as ImageIcon, X, Globe, Upload } from "lucide-react";

interface CollegeForm {
  name: string;
  description: string;
  website: string;
  clubLink: string;
}

const EMPTY: CollegeForm = { name: "", description: "", website: "", clubLink: "" };

export default function CollegesAdminPage() {
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CollegeForm>(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/colleges");
      setColleges(res.data);
    } finally { setLoading(false); }
  };

  const filtered = useMemo(() =>
    colleges.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [colleges, search]
  );

  const openAdd = () => { setForm(EMPTY); setEditId(null); setPhotoFile(null); setLogoFile(null); setShowForm(true); };
  const openEdit = (c: ICollege) => {
    setForm({ name: c.name, description: c.description || "", website: c.website || "", clubLink: c.clubLink || "" });
    setEditId(c._id);
    setPhotoFile(null);
    setLogoFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      let collegeId = editId;
      if (editId) {
        await api.patch(`/colleges/${editId}`, form);
      } else {
        const res = await api.post("/colleges", form);
        collegeId = res.data._id;
      }

      // Upload photo if provided
      if (photoFile && collegeId) {
        const fd = new FormData();
        fd.append("photo", photoFile);
        await api.patch(`/colleges/${collegeId}/photo`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Upload logo if provided
      if (logoFile && collegeId) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        await api.patch(`/colleges/${collegeId}/logo`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setMsg({ type: "success", text: `College ${editId ? "updated" : "created"} successfully.` });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to save college." });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/colleges/${id}`);
      load();
    } catch { alert("Failed to delete college."); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Colleges Management</h2>
          <div className="flex gap-3">
            <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
            <button onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Add College
            </button>
          </div>
        </div>

        {msg.text && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {msg.text}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <div key={c._id} className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Cover */}
                <div className="relative h-32 bg-gradient-to-br from-indigo-50 to-blue-100">
                  {c.photo?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photo.url} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl font-bold text-indigo-200">{c.name[0]}</div>
                  )}
                  {/* Logo overlay */}
                  {c.logo?.url && (
                    <div className="absolute bottom-2 left-3 h-9 w-9 overflow-hidden rounded-xl bg-white shadow ring-1 ring-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.logo.url} alt="logo" className="h-full w-full object-contain p-1" />
                    </div>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline">{c.website}</a>}
                  <div className="mt-3 flex gap-1.5">
                    <button onClick={() => openEdit(c)} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <a href={`/college/${encodeURIComponent(c.name)}/gallery`} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">
                      <ImageIcon className="h-3 w-3" /> Gallery
                    </a>
                    <button onClick={() => handleDelete(c._id, c.name)} className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-50">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="col-span-3 py-10 text-center text-sm text-slate-400">No colleges found.</p>}
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">{editId ? "Edit College" : "Add College"}</h3>
                <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>

              <div className="space-y-3">
                {[
                  { field: "name", label: "College Name", required: true },
                  { field: "description", label: "Short Description" },
                  { field: "website", label: "Website URL" },
                  { field: "clubLink", label: "Club Register Link" },
                ].map(({ field, label, required }) => (
                  <div key={field}>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
                    <input type="text" required={required} value={(form as unknown as Record<string, string>)[field]}

                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      <Upload className="inline h-3 w-3 mr-1" />Cover Photo
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      <Upload className="inline h-3 w-3 mr-1" />Logo
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs outline-none" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60">
                {saving ? "Saving…" : editId ? "Update College" : "Create College"}
              </button>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
