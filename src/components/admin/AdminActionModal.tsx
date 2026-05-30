"use client";
import React, { useEffect, useState } from "react";
import api from "@/lib/apiClient";

export default function AdminActionModal({ open, onClose, action, memberId, onSuccess }: { open: boolean; onClose: () => void; action: "promote" | "copy"; memberId?: string; onSuccess?: () => void }) {
  const [roles, setRoles] = useState<any[]>([]);
  const [committees, setCommittees] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ toRoleId: "", targetRoleId: "", targetTermId: "", targetCommitteeId: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [r, c, t] = await Promise.all([api.get("/admin/roles"), api.get("/admin/committees"), api.get("/admin/terms")]);
        setRoles(r.data || []);
        setCommittees(c.data || []);
        setTerms(t.data || []);
      } catch (err) {
        // ignore
      }
    })();
  }, [open]);

  if (!open) return null;

  async function submit() {
    setBusy(true);
    try {
      if (action === "promote") {
        await api.post("/admin/team/actions", { action: "promote", memberId, toRoleId: form.toRoleId, termId: form.targetTermId, committeeId: form.targetCommitteeId });
      } else if (action === "copy") {
        await api.post("/admin/team/actions", { action: "copy", memberId, targetRoleId: form.targetRoleId, targetTermId: form.targetTermId, targetCommitteeId: form.targetCommitteeId });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      // simple alert for now
      // eslint-disable-next-line no-alert
      alert("Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold mb-4">{action === "promote" ? "Promote Member" : "Copy Member to Term"}</h3>
        {action === "promote" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Target Role</label>
            <select value={form.toRoleId} onChange={(e) => setForm({ ...form, toRoleId: e.target.value })} className="w-full rounded border px-3 py-2">
              <option value="">Select role</option>
              {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>

            <label className="block text-sm font-medium">Term (optional)</label>
            <select value={form.targetTermId} onChange={(e) => setForm({ ...form, targetTermId: e.target.value })} className="w-full rounded border px-3 py-2">
              <option value="">Use current term</option>
              {terms.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>

            <label className="block text-sm font-medium">Team / Committee (optional)</label>
            <select value={form.targetCommitteeId} onChange={(e) => setForm({ ...form, targetCommitteeId: e.target.value })} className="w-full rounded border px-3 py-2">
              <option value="">Use current team</option>
              {committees.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {action === "copy" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Target Term</label>
            <select value={form.targetTermId} onChange={(e) => setForm({ ...form, targetTermId: e.target.value })} className="w-full rounded border px-3 py-2">
              <option value="">Select term</option>
              {terms.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>

            <label className="block text-sm font-medium">Target Committee</label>
            <select value={form.targetCommitteeId} onChange={(e) => setForm({ ...form, targetCommitteeId: e.target.value })} className="w-full rounded border px-3 py-2">
              <option value="">Select committee</option>
              {committees.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>

            <label className="block text-sm font-medium">Target Role</label>
            <select value={form.targetRoleId} onChange={(e) => setForm({ ...form, targetRoleId: e.target.value })} className="w-full rounded border px-3 py-2">
              <option value="">Select role</option>
              {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded px-3 py-2 border">Cancel</button>
          <button onClick={submit} disabled={busy} className="rounded bg-indigo-600 px-3 py-2 text-white">{busy ? "Working..." : "Confirm"}</button>
        </div>
      </div>
    </div>
  );
}
