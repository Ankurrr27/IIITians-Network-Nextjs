"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BellRing, Plus, Sparkles, AlertCircle } from "lucide-react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { IAppNotification } from "@/types";

const initialForm = {
  title: "",
  message: "",
  type: "milestone",
  colorTone: "indigo" as typeof colorOptions[number],
  order: 0,
  isActive: false,
  showOnEntry: true,
};

const typeOptions = [
  "milestone",
  "event",
  "team",
  "legacy",
  "post",
  "club",
];

const colorOptions = [
  "indigo",
  "emerald",
  "sky",
  "amber",
  "rose",
  "fuchsia",
  "slate",
] as const;

const colorChipMap: Record<string, string> = {
  indigo: "bg-indigo-100 text-indigo-700",
  emerald: "bg-emerald-100 text-emerald-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  fuchsia: "bg-fuchsia-100 text-fuchsia-700",
  slate: "bg-slate-200 text-slate-700",
};

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
    setError("");

    try {
      const response = await api.get<IAppNotification[]>("/app-notifications");
      setNotifications(response.data || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Could not load app notifications."
      );
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
      const matchesColor =
        colorFilter === "all" || item.colorTone === colorFilter;

      return matchesStatus && matchesType && matchesColor;
    });
  }, [notifications, statusFilter, typeFilter, colorFilter]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    const checked = (event.target as HTMLInputElement).checked;

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
      colorTone: (item.colorTone as typeof colorOptions[number]) || "indigo",
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
    setError("");
    setSuccess("");

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
      setError(
        err.response?.data?.message || "Could not save app notification."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleQuickUpdate = async (id: string, payload: Partial<IAppNotification>) => {
    try {
      await api.patch(`/app-notifications/${id}`, payload);
      await loadNotifications();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Could not update this notification."
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this notification permanently?"))
      return;
    try {
      await api.delete(`/app-notifications/${id}`);
      setSuccess("Notification deleted successfully.");
      await loadNotifications();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not delete notification.");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="rounded-[1.25rem] border border-slate-200 bg-white px-5 py-10 text-center font-semibold text-slate-500 shadow-sm">
          Loading notification workspace...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
                In-app notifications
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Notification Workspace
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 font-semibold">
                Create, edit, order, filter, and activate custom notifications
                that show inside the app.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 font-bold">
                Total notifications:{" "}
                <span className="font-extrabold">{notifications.length}</span>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900 font-bold">
                Active:{" "}
                <span className="font-extrabold">
                  {notifications.filter((item) => item.isActive).length}
                </span>
              </div>
            </div>
          </div>
        </section>

        {(error || success) && (
          <div className="space-y-2">
            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-rose-50 px-4 py-3 text-[13px] font-semibold text-rose-600 ring-1 ring-rose-200">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-600 ring-1 ring-emerald-200">
                <Sparkles size={16} />
                {success}
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? "Edit notification" : "Create notification"}
              </h2>
              <p className="mt-1 text-sm text-slate-600 font-semibold">
                Raise a custom notification for app users on entry.
              </p>
            </div>
            {!editingId && (
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md">
                <Plus className="h-4 w-4" />
                New notification
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Title</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Notification Title"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 text-sm font-medium"
              />
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Notification message body..."
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 text-sm font-medium"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Type</span>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 text-sm font-semibold cursor-pointer"
              >
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Color Tone</span>
              <select
                name="colorTone"
                value={form.colorTone}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 text-sm font-semibold cursor-pointer"
              >
                {colorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Order</span>
              <input
                type="number"
                name="order"
                value={form.order}
                onChange={handleChange}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 text-sm font-medium"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-semibold cursor-pointer transition hover:bg-slate-100">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              Notification is active
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-semibold cursor-pointer transition hover:bg-slate-100">
              <input
                type="checkbox"
                name="showOnEntry"
                checked={form.showOnEntry}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              Show on app entry
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 shadow-md"
            >
              {saving ? "Saving..." : editingId ? "Save changes" : "Create notification"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <section className="space-y-3 rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Existing Notifications
              </h2>
              <p className="mt-1 text-sm text-slate-600 font-semibold">
                Filter, reorder, activate, and edit all saved notifications.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 cursor-pointer"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 cursor-pointer"
              >
                <option value="all">All types</option>
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={colorFilter}
                onChange={(event) => setColorFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 cursor-pointer"
              >
                <option value="all">All colors</option>
                {colorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredNotifications.map((item, index) => (
              <article
                key={item._id}
                className="rounded-[1.15rem] border border-slate-200 bg-slate-50/80 p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                        <BellRing className="h-3.5 w-3.5" />
                        #{item.order ?? index + 1}
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                          item.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.isActive ? "active" : "inactive"}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 ring-1 ring-slate-200">
                        {item.type}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                          colorChipMap[item.colorTone || "indigo"] || colorChipMap.indigo
                        }`}
                      >
                        {item.colorTone}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {item.title || "Untitled notification"}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600 font-semibold">
                        {item.message || "No message added yet."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                      <span>Show on entry: {item.showOnEntry ? "Yes" : "No"}</span>
                      {item.updatedAt && (
                        <span>Updated: {new Date(item.updatedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:w-[22rem] lg:justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickUpdate(item._id, { isActive: !item.isActive })
                      }
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      {item.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickUpdate(item._id, {
                          order: Math.max(0, Number(item.order || 0) - 1),
                        })
                      }
                      className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickUpdate(item._id, {
                          order: Number(item.order || 0) + 1,
                        })
                      }
                      className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {filteredNotifications.length === 0 && (
              <p className="py-10 text-center text-sm font-semibold text-slate-400">
                No matching notifications found.
              </p>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
