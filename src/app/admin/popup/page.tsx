"use client";

import { useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, CircleOff, Save, Sparkles } from "lucide-react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import { AdminCard, AdminCardHeader } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminInput } from "@/components/admin/AdminInput";

interface PopupForm {
  enabled: boolean;
  startsAt: string;
  endsAt: string;
}

interface PopupSettingsResponse {
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

const initialForm: PopupForm = { enabled: false, startsAt: "", endsAt: "" };

function toLocalInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export default function PopupSchedulePage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => setNow(Date.now());
    const initialTimer = window.setTimeout(updateTime, 0);
    const interval = window.setInterval(updateTime, 60_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get<PopupSettingsResponse>("/admin/popup");
        setForm({
          enabled: response.data.enabled,
          startsAt: toLocalInput(response.data.startsAt),
          endsAt: toLocalInput(response.data.endsAt),
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Could not load popup settings.");
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const startTime = form.startsAt ? new Date(form.startsAt).getTime() : null;
  const endTime = form.endsAt ? new Date(form.endsAt).getTime() : null;
  const status = now === null
    ? "Checking"
    : !form.enabled
    ? "Off"
    : startTime !== null && now < startTime
      ? "Scheduled"
      : endTime !== null && now >= endTime
        ? "Ended"
        : "Active";

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (startTime !== null && endTime !== null && endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }

    setSaving(true);
    try {
      await api.patch("/admin/popup", {
        enabled: form.enabled,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      });
      setSuccess("Popup schedule saved.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save popup settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminHeader
          title="Tournament Popup"
          description="Control when the Inter-IIIT Esports Championship popup is shown across the public site."
          icon={CalendarClock}
          badge="Site content"
          badgeColor="sky"
          backHref="/admin"
          stats={
            <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${status === "Active" ? "bg-emerald-50 text-emerald-700" : status === "Scheduled" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
              {status === "Active" ? <CheckCircle2 className="h-4 w-4" /> : <CircleOff className="h-4 w-4" />}
              {status}
            </div>
          }
        />

        {(error || success) && (
          <div className={`flex items-center gap-2 rounded-xl p-3 text-sm font-semibold ${error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
            {error ? <CircleOff className="h-4 w-4 shrink-0" /> : <Sparkles className="h-4 w-4 shrink-0" />}
            {error || success}
          </div>
        )}

        <AdminCard>
          <form onSubmit={handleSave} className="space-y-5">
            <AdminCardHeader
              title="Display window"
              description="The popup is shown only while enabled and within the selected time window. Times use your browser's local timezone."
            />

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))}
                className="h-4 w-4 accent-indigo-600"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900">Enable popup</span>
                <span className="mt-0.5 block text-xs text-slate-500">Turn this off to deactivate it immediately.</span>
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminInput
                label="Activate at"
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
                disabled={loading}
              />
              <AdminInput
                label="Deactivate at"
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => setForm((current) => ({ ...current, endsAt: event.target.value }))}
                disabled={loading}
              />
            </div>
            <p className="text-xs leading-5 text-slate-500">Leave a time empty for no scheduled boundary. The enabled switch must be on for the schedule to run.</p>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <AdminButton type="submit" icon={Save} isLoading={saving} disabled={loading}>
                Save schedule
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
