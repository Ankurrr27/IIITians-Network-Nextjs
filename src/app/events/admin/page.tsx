"use client";
import { useEffect, useState } from "react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { IEvent } from "@/types";
import { Plus, Trash2, Pencil, X } from "lucide-react";

interface EventForm {
  title: string;
  collegeName: string;
  clubName: string;
  description: string;
  date: string;
  link: string;
  type: string;
  isPublished: boolean;
}

const EMPTY: EventForm = { title: "", collegeName: "", clubName: "", description: "", date: "", link: "", type: "hackathon", isPublished: true };

export default function EventsAdminPage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch { /*silent*/ } finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (e: IEvent) => {
    setForm({ title: e.title, collegeName: e.collegeName, clubName: e.clubName || "", description: e.description || "", date: e.date ? e.date.slice(0, 10) : "", link: e.link || "", type: e.type || "hackathon", isPublished: e.isPublished ?? true });
    setEditId(e._id);
    setShowForm(true);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    try {
      if (editId) await api.patch(`/events/${editId}`, form);
      else {
        await api.post("/events", form);
      }
      setShowForm(false);
      load();
    } catch { alert("Failed to save event."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await api.delete(`/events/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Events Management</h2>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Add Event
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>
        ) : (
          <div className="space-y-3">
            {events.map((e) => (
              <div key={e._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                  <p className="text-xs text-slate-500">{e.collegeName} · {new Date(e.date).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(e)} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(e._id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="py-10 text-center text-sm text-slate-400">No events yet.</p>}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
            <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">{editId ? "Edit Event" : "Add Event"}</h3>
                <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              {(["title", "collegeName", "clubName", "description", "link"] as const).map((field) => (
                <div key={field}>
                  <label className="mb-1 block text-xs font-semibold capitalize text-slate-600">{field}</label>
                  {field === "description" ? (
                    <textarea rows={3} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
                  ) : (
                    <input type={field === "link" ? "url" : "text"} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      required={field === "title" || field === "collegeName"}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
                  )}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Date</label>
                  <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300">
                    {["hackathon", "tech-talk", "cultural", "sports", "workshop", "seminar", "other"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700">
                {editId ? "Update" : "Create"} Event
              </button>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
