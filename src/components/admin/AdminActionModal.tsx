"use client";

import { useEffect, useState } from "react";
import api from "@/lib/apiClient";

interface NamedOption {
  _id: string;
  name: string;
}

interface ActionForm {
  toRoleId: string;
  targetRoleId: string;
  targetTermId: string;
  targetCommitteeId: string;
}

const initialForm: ActionForm = {
  toRoleId: "",
  targetRoleId: "",
  targetTermId: "",
  targetCommitteeId: "",
};

export default function AdminActionModal({ open, onClose, action, memberId, hasActiveTenure = true, onSuccess }: { open: boolean; onClose: () => void; action: "promote" | "copy"; memberId?: string; hasActiveTenure?: boolean; onSuccess?: () => void }) {
  const [roles, setRoles] = useState<NamedOption[]>([]);
  const [committees, setCommittees] = useState<NamedOption[]>([]);
  const [terms, setTerms] = useState<NamedOption[]>([]);
  const [form, setForm] = useState<ActionForm>(initialForm);
  const [busy, setBusy] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(initialForm);
    setError("");
    setLoadingOptions(true);
    void (async () => {
      const results = await Promise.allSettled([
        api.get<NamedOption[]>("/admin/roles"),
        api.get<NamedOption[]>("/admin/committees"),
        api.get<NamedOption[]>("/admin/terms"),
      ]);
      const failures: string[] = [];
      if (results[0].status === "fulfilled") setRoles(results[0].value.data || []);
      else failures.push("positions");
      if (results[1].status === "fulfilled") setCommittees(results[1].value.data || []);
      else failures.push("teams");
      if (results[2].status === "fulfilled") setTerms(results[2].value.data || []);
      else failures.push("terms");
      if (failures.length) {
        setError(`Could not load ${failures.join(", ")}. Close and reopen this dialog to retry.`);
      }
      setLoadingOptions(false);
    })();
  }, [open]);

  if (!open) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!memberId) return setError("Select a team member first.");
    if (action === "promote" && !form.toRoleId) return setError("Select a position to promote this member into.");
    if (action === "promote" && !hasActiveTenure && (!form.targetTermId || !form.targetCommitteeId)) {
      return setError("Select a term and team to activate this archived member.");
    }
    if (action === "copy" && (!form.targetTermId || !form.targetRoleId || !form.targetCommitteeId)) {
      return setError("Select a target term, team, and position.");
    }

    setBusy(true);
    try {
      if (action === "promote") {
        await api.post("/admin/team/actions", { action, memberId, toRoleId: form.toRoleId, termId: form.targetTermId, committeeId: form.targetCommitteeId });
      } else {
        await api.post("/admin/team/actions", { action, memberId, targetRoleId: form.targetRoleId, targetTermId: form.targetTermId, targetCommitteeId: form.targetCommitteeId });
      }
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const responseMessage = typeof err === "object" && err !== null && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(responseMessage || (err instanceof Error ? err.message : "Action failed."));
    } finally {
      setBusy(false);
    }
  };

  const selectClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{action === "promote" ? "Promote Member" : "Copy Member to Term"}</h3>
          <p className="mt-1 text-sm text-slate-500">{action === "promote" ? "Choose the new position and optional assignment." : "Choose a term, team, and position for the copied assignment."}</p>
        </div>

        {action === "promote" ? (
          <>
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              Target position
              <select required value={form.toRoleId} onChange={(event) => setForm({ ...form, toRoleId: event.target.value })} className={selectClass}>
                <option value="">Select position</option>
                {roles.map((role) => <option key={role._id} value={role._id}>{role.name}</option>)}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              {hasActiveTenure ? "Term" : "New term"}
              <select value={form.targetTermId} onChange={(event) => setForm({ ...form, targetTermId: event.target.value })} className={selectClass}>
                <option value="">{hasActiveTenure ? "Keep current term" : "Select term"}</option>
                {terms.map((term) => <option key={term._id} value={term._id}>{term.name}</option>)}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              {hasActiveTenure ? "Team / committee" : "New team / committee"}
              <select value={form.targetCommitteeId} onChange={(event) => setForm({ ...form, targetCommitteeId: event.target.value })} className={selectClass}>
                <option value="">{hasActiveTenure ? "Keep current team" : "Select team"}</option>
                {committees.map((committee) => <option key={committee._id} value={committee._id}>{committee.name}</option>)}
              </select>
            </label>
          </>
        ) : (
          <>
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              Target term
              <select required value={form.targetTermId} onChange={(event) => setForm({ ...form, targetTermId: event.target.value })} className={selectClass}>
                <option value="">Select term</option>
                {terms.map((term) => <option key={term._id} value={term._id}>{term.name}</option>)}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              Target team / committee
              <select required value={form.targetCommitteeId} onChange={(event) => setForm({ ...form, targetCommitteeId: event.target.value })} className={selectClass}>
                <option value="">Select team</option>
                {committees.map((committee) => <option key={committee._id} value={committee._id}>{committee.name}</option>)}
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-semibold text-slate-700">
              Target position
              <select required value={form.targetRoleId} onChange={(event) => setForm({ ...form, targetRoleId: event.target.value })} className={selectClass}>
                <option value="">Select position</option>
                {roles.map((role) => <option key={role._id} value={role._id}>{role.name}</option>)}
              </select>
            </label>
          </>
        )}

        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={busy || loadingOptions || !roles.length || (action === "copy" && (!terms.length || !committees.length)) || (action === "promote" && !hasActiveTenure && (!terms.length || !committees.length))} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy ? "Working..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
}
