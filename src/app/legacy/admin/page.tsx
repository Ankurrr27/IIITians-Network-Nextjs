"use client";
import { useEffect, useState } from "react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { IAlumni } from "@/types";
import { Check, X, Trash2, Pencil } from "lucide-react";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function LegacyAdminPage() {
  const [alumni, setAlumni] = useState<IAlumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, [statusFilter, search]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/alumni/admin/requests", { params: { status: statusFilter, search } });
      setAlumni(res.data);
    } catch { /*silent*/ } finally { setLoading(false); }
  };

  const setStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    await api.patch(`/alumni/${id}/status`, { status });
    load();
  };

  const deleteAlumni = async (id: string) => {
    if (!confirm("Delete this profile?")) return;
    await api.delete(`/alumni/admin/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Network Legacy Admin</h2>

        <div className="flex flex-wrap gap-3">
          {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${statusFilter === s ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>
              {s}
            </button>
          ))}
          <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>
        ) : (
          <div className="space-y-3">
            {alumni.map((a) => (
              <div key={a._id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                  <p className="text-xs text-slate-500">{a.iiit} · {a.branch} · {a.graduationYear}</p>
                  <p className="text-xs text-slate-400">{a.email}</p>
                  {a.currentRole && <p className="text-xs text-indigo-600">{a.currentRole}{a.currentCompany ? ` @ ${a.currentCompany}` : ""}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <span className={`self-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${a.status === "approved" ? "bg-emerald-50 text-emerald-600" : a.status === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
                    {a.status || "approved"}
                  </span>
                  {a.status !== "approved" && (
                    <button onClick={() => setStatus(a._id, "approved")} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition"><Check className="h-4 w-4" /></button>
                  )}
                  {a.status !== "rejected" && (
                    <button onClick={() => setStatus(a._id, "rejected")} className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition"><X className="h-4 w-4" /></button>
                  )}
                  <button onClick={() => deleteAlumni(a._id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {alumni.length === 0 && <p className="py-10 text-center text-sm text-slate-400">No profiles found.</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
