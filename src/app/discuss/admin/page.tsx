"use client";
import { useEffect, useState } from "react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { IDiscussPost, IDiscussAccount } from "@/types";
import { Check, X, Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import DiscussCard from "@/components/discuss/DiscussCard";

type Tab = "posts" | "accounts";

export default function DiscussAdminPage() {
  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<IDiscussPost[]>([]);
  const [accounts, setAccounts] = useState<IDiscussAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [postsRes, accRes] = await Promise.all([
        api.get("/discuss"),
        api.get("/discuss-accounts"),
      ]);
      setPosts(postsRes.data || []);
      setAccounts(accRes.data || []);
    } finally { setLoading(false); }
  };

  const setPostStatus = async (id: string, status: string) => {
    await api.patch(`/discuss/${id}`, { status });
    loadAll();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await api.delete(`/discuss/${id}`);
    loadAll();
  };

  const toggleAccountAuth = async (id: string, current: boolean) => {
    await api.patch(`/discuss-accounts/${id}`, { isAuthorized: !current });
    loadAll();
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("Delete this club account?")) return;
    await api.delete(`/discuss-accounts/${id}`);
    loadAll();
  };

  const filteredPosts = posts.filter((p) => statusFilter === "all" ? true : p.status === statusFilter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Discuss Admin</h2>

        {/* Tabs */}
        <div className="flex gap-2 rounded-full bg-slate-100 p-1 w-fit">
          {(["posts", "accounts"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-full px-5 py-1.5 text-sm font-semibold transition capitalize ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>
        ) : tab === "posts" ? (
          <>
            {/* Status filter */}
            <div className="flex flex-wrap gap-2">
              {["all", "pending", "approved", "rejected"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${statusFilter === s ? "bg-slate-900 text-white" : "bg-white ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {s}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredPosts.map((p) => (
                <DiscussCard
                  key={p._id}
                  post={p}
                  onApprove={(id) => setPostStatus(id, "approved")}
                  onReject={(id) => setPostStatus(id, "rejected")}
                  onDelete={deletePost}
                />
              ))}
              {filteredPosts.length === 0 && <p className="py-10 text-center text-sm text-slate-400">No posts found.</p>}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {accounts.map((a) => (
              <div key={a._id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{a.clubName}</p>
                  <p className="text-xs text-slate-500">{a.collegeName} · {a.email}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{a.contactName}{a.contactPhone ? ` · ${a.contactPhone}` : ""}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${a.isAuthorized ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    {a.isAuthorized ? "Verified" : "Pending"}
                  </span>
                  <button onClick={() => toggleAccountAuth(a._id, a.isAuthorized)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    title={a.isAuthorized ? "Revoke" : "Authorize"}>
                    {a.isAuthorized ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  </button>
                  <button onClick={() => deleteAccount(a._id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {accounts.length === 0 && <p className="py-10 text-center text-sm text-slate-400">No club accounts.</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
