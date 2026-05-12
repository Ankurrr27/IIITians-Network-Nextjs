"use client";
import { useEffect, useState } from "react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { IAppNotification } from "@/types";
import { Plus, Trash2, Pencil, X } from "lucide-react";

interface NForm { title: string; message: string; type: string; isActive: boolean; showOnEntry: boolean; order: number; }
const EMPTY: NForm = { title: "", message: "", type: "milestone", isActive: true, showOnEntry: true, order: 0 };

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<IAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<NForm>(EMPTY);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      // Fetch all notifications (admin can see inactive too)
      const res = await api.get("/app-notifications");
      setNotifications(res.data);
    } catch { /*silent*/ } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) await api.patch(`/app-notifications/${editId}`, form);
      else await api.post("/app-notifications", form);
      setShowForm(false);
      setEditId(null);
      load();
    } catch { alert("Failed to save."); }
  };

  const openEdit = (n: IAppNotification) => {
    setForm({ title: n.title, message: n.message, type: n.type || "milestone", isActive: n.isActive ?? true, showOnEntry: n.showOnEntry ?? true, order: n.order ?? 0 });
    setEditId(n._id);
    setShowForm(true);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.patch(`/app-notifications/${id}`, { isActive: !isActive });
    load();
  };

  const deleteNotification = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    await api.delete(`/app-notifications/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">App Notifications</h2>
          <button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Add Notification
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n._id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.message}</p>
                  <div className="mt-1 flex gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${n.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>{n.isActive ? "Active" : "Inactive"}</span>
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase text-indigo-600">{n.type}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => toggleActive(n._id, n.isActive!)} className="rounded-lg p-2 text-xs font-semibold text-slate-400 hover:bg-slate-50">{n.isActive ? "Deactivate" : "Activate"}</button>
                  <button onClick={() => openEdit(n)} className="rounded-lg p-2 text-slate-400 hover:text-indigo-600"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteNotification(n._id)} className="rounded-lg p-2 text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <p className="py-10 text-center text-sm text-slate-400">No notifications created yet.</p>}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowForm(false)}>
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">{editId ? "Edit" : "Add"} Notification</h3>
                <button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Title</label>
                <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Message</label>
                <textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300">
                    {["milestone", "event", "post", "legacy", "team", "club"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <input type="checkbox" checked={form.showOnEntry} onChange={(e) => setForm({ ...form, showOnEntry: e.target.checked })} className="rounded" />
                  Show on entry
                </label>
              </div>
              <button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white">{editId ? "Update" : "Create"}</button>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
