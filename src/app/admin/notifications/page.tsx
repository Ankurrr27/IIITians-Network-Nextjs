"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BellRing, Plus, Sparkles, AlertCircle } from "lucide-react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import { AdminHeader, AdminStatCard } from "@/components/admin/AdminHeader";
import { AdminCard, AdminCardHeader } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/AdminInput";
import type { IAppNotification } from "@/types";

const initialForm = {
  title: "",
  message: "",
  type: "milestone",
  colorTone: "indigo" as "indigo" | "emerald" | "sky" | "amber" | "rose" | "fuchsia" | "slate",
  order: 0,
  isActive: false,
  showOnEntry: true,
};

const typeOptions = [
  { label: "Milestone", value: "milestone" },
  { label: "Event", value: "event" },
  { label: "Team", value: "team" },
  { label: "Legacy", value: "legacy" },
  { label: "Post", value: "post" },
  { label: "Club", value: "club" },
];

const colorOptions = [
  { label: "Indigo", value: "indigo" },
  { label: "Emerald", value: "emerald" },
  { label: "Sky", value: "sky" },
  { label: "Amber", value: "amber" },
  { label: "Rose", value: "rose" },
  { label: "Fuchsia", value: "fuchsia" },
  { label: "Slate", value: "slate" },
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<IAppNotification[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get<IAppNotification[]>("/app-notifications");
      setNotifications(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not load app notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesColor = colorFilter === "all" || item.colorTone === colorFilter;

      return matchesStatus && matchesType && matchesColor;
    });
  }, [notifications, statusFilter, typeFilter, colorFilter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "order" ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const startEdit = (item: IAppNotification) => {
    setEditingId(item._id);
    setForm({
      title: item.title || "",
      message: item.message || "",
      type: item.type || "milestone",
      colorTone: (item.colorTone as any) || "indigo",
      order: item.order ?? 0,
      isActive: Boolean(item.isActive),
      showOnEntry: Boolean(item.showOnEntry),
    });
    setSuccess("");
    setError("");
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/app-notifications/${editingId}`, form);
        setSuccess("Notification updated successfully.");
      } else {
        await api.post("/app-notifications", form);
        setSuccess("Notification created successfully.");
      }
      resetForm();
      await loadNotifications();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not save app notification.");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickUpdate = async (id: string, payload: Partial<IAppNotification>) => {
    try {
      await api.patch(`/app-notifications/${id}`, payload);
      await loadNotifications();
    } catch (err: any) {
      setError("Could not update this notification.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notification permanently?")) return;
    try {
      await api.delete(`/app-notifications/${id}`);
      setSuccess("Notification deleted successfully.");
      await loadNotifications();
    } catch (err: any) {
      setError("Could not delete notification.");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminCard padding="lg" className="flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></AdminCard>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminHeader
          title="Notification Workspace"
          description="Create, edit, order, filter, and activate custom notifications that show inside the app."
          badge="In-app notifications"
          backHref="/admin"
          icon={BellRing}
          stats={
            <div className="grid grid-cols-2 gap-2">
              <AdminStatCard label="Total" value={notifications.length} color="slate" />
              <AdminStatCard label="Active" value={notifications.filter((item) => item.isActive).length} color="emerald" />
            </div>
          }
        />

        {(error || success) && (
          <div className="space-y-2">
            {error && <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-600"><AlertCircle className="h-4 w-4"/> {error}</div>}
            {success && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-600"><Sparkles className="h-4 w-4"/> {success}</div>}
          </div>
        )}

        <AdminCard>
          <form onSubmit={handleSave} className="space-y-5">
            <AdminCardHeader 
              title={editingId ? "Edit notification" : "Create notification"}
              description="Raise a custom notification for app users on entry."
              action={!editingId && <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"><Plus className="h-3 w-3" /> New</div>}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <AdminInput label="Title" name="title" value={form.title} onChange={handleChange} required placeholder="Notification Title" />
              </div>
              <div className="sm:col-span-2">
                <AdminTextarea label="Message" name="message" value={form.message} onChange={handleChange} required rows={3} placeholder="Notification message body..." />
              </div>
              <AdminSelect label="Type" name="type" value={form.type} onChange={handleChange} options={typeOptions} />
              <AdminSelect label="Color Tone" name="colorTone" value={form.colorTone} onChange={handleChange} options={colorOptions} />
              <AdminInput label="Order" type="number" name="order" value={form.order} onChange={handleChange} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-semibold cursor-pointer transition hover:bg-slate-100">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                Notification is active
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-semibold cursor-pointer transition hover:bg-slate-100">
                <input type="checkbox" name="showOnEntry" checked={form.showOnEntry} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                Show on app entry
              </label>
            </div>

            <div className="flex gap-3">
              <AdminButton type="submit" isLoading={saving}>{editingId ? "Save changes" : "Create notification"}</AdminButton>
              {editingId && <AdminButton type="button" variant="outline" onClick={resetForm}>Cancel edit</AdminButton>}
            </div>
          </form>
        </AdminCard>

        <AdminCard>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Existing Notifications</h2>
              <p className="mt-1 text-sm text-slate-500 font-medium">Filter, reorder, and edit saved notifications.</p>
            </div>
            <div className="flex gap-2">
              <AdminSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{label:"All Status", value:"all"}, {label:"Active", value:"active"}, {label:"Inactive", value:"inactive"}]} />
              <AdminSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={[{label:"All Types", value:"all"}, ...typeOptions]} />
              <AdminSelect value={colorFilter} onChange={(e) => setColorFilter(e.target.value)} options={[{label:"All Colors", value:"all"}, ...colorOptions]} />
            </div>
          </div>

          <div className="grid gap-3">
            {filteredNotifications.map((item, index) => (
              <div key={item._id} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
                <div>
                  <div className="flex gap-2 mb-2 items-center">
                    <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">#{item.order ?? index + 1}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>{item.isActive ? "Active" : "Inactive"}</span>
                    <span className="bg-white text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-slate-200">{item.type}</span>
                    <span className="bg-white text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-slate-200">{item.colorTone}</span>
                  </div>
                  <h3 className="font-bold text-slate-900">{item.title || "Untitled"}</h3>
                  <p className="text-sm text-slate-500">{item.message}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <AdminButton size="sm" variant="outline" onClick={() => startEdit(item)}>Edit</AdminButton>
                  <AdminButton size="sm" variant="secondary" onClick={() => handleQuickUpdate(item._id, { isActive: !item.isActive })}>{item.isActive ? "Deactivate" : "Activate"}</AdminButton>
                  <div className="flex gap-1">
                    <AdminButton size="sm" variant="outline" icon={ArrowUp} onClick={() => handleQuickUpdate(item._id, { order: Math.max(0, Number(item.order || 0) - 1) })} aria-label="Up" />
                    <AdminButton size="sm" variant="outline" icon={ArrowDown} onClick={() => handleQuickUpdate(item._id, { order: Number(item.order || 0) + 1 })} aria-label="Down" />
                  </div>
                  <AdminButton size="sm" variant="ghost" icon={AlertCircle} onClick={() => handleDelete(item._id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50" aria-label="Delete" />
                </div>
              </div>
            ))}
            {filteredNotifications.length === 0 && <div className="py-8 text-center text-slate-500 text-sm">No notifications found.</div>}
          </div>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
