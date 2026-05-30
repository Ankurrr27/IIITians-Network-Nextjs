"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Mail,
  Newspaper,
  Phone,
  ShieldCheck,
  Trash2,
  UserCog,
  XCircle,
  AlertCircle,
  Sparkles,
  Plus,
} from "lucide-react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { IDiscussPost, IDiscussAccount } from "@/types";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";

const statusOptions = ["pending", "approved", "rejected"];
const roleOptions = ["club_member", "club_manager", "publisher"];

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/80">
      <div className="text-sm font-medium text-slate-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approved
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">
        <XCircle className="h-3.5 w-3.5" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
      <Clock3 className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

export default function DiscussAdminPage() {
  const [posts, setPosts] = useState<IDiscussPost[] | any[]>([]);
  const [accounts, setAccounts] = useState<IDiscussAccount[]>([]);
  const [activeSection, setActiveSection] = useState<"clubs" | "posts">("clubs");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [postsResponse, accountsResponse] = await Promise.all([
        api.get("/discuss/admin/all"),
        api.get("/discuss-accounts/admin/all"),
      ]);
      setPosts(postsResponse.data || []);
      setAccounts(accountsResponse.data || []);
    } catch (err: any) {
      setError("Could not load discuss admin data.");
      setPosts([]);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setSavingId(id);
    setError("");
    setSuccess("");
    try {
      const response = await api.patch(`/discuss/${id}`, { status });
      setPosts((prev) => prev.map((post) => (post._id === id ? response.data : post)));
      setSuccess("Post status updated.");
    } catch (err: any) {
      setError("Could not update discuss post status.");
    } finally {
      setSavingId("");
    }
  };

  const deletePost = async (id: string) => {
    const ok = window.confirm("Delete this discuss post permanently?");
    if (!ok) return;
    setSavingId(id);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/discuss/${id}`);
      setPosts((prev) => prev.filter((post) => post._id !== id));
      setSuccess("Post deleted successfully.");
    } catch (err: any) {
      setError("Could not delete discuss post.");
    } finally {
      setSavingId("");
    }
  };

  const updateAccount = async (id: string, updates: Partial<IDiscussAccount>) => {
    setSavingId(id);
    setError("");
    setSuccess("");
    try {
      const response = await api.patch(`/discuss-accounts/admin/${id}`, updates);
      // Backend returns { account } or directly account
      const updatedAccount = response.data.account || response.data;
      setAccounts((prev) =>
        prev.map((account) => (account._id === id ? updatedAccount : account))
      );
      setSuccess("Discuss account updated.");
    } catch (err: any) {
      setError("Could not update discuss account.");
    } finally {
      setSavingId("");
    }
  };

  const deleteAccount = async (id: string) => {
    const ok = window.confirm("Delete this discuss account permanently?");
    if (!ok) return;
    setSavingId(id);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/discuss-accounts/admin/${id}`);
      setAccounts((prev) => prev.filter((account) => account._id !== id));
      setSuccess("Discuss account deleted.");
    } catch (err: any) {
      setError("Could not delete discuss account.");
    } finally {
      setSavingId("");
    }
  };

  const getPostCount = (account: IDiscussAccount) =>
    posts.filter(
      (post) =>
        (post.clubName || "").trim().toLowerCase() ===
          (account.clubName || "").trim().toLowerCase() &&
        (post.collegeName || "").trim().toLowerCase() ===
          (account.collegeName || "").trim().toLowerCase()
    ).length;

  const stats = {
    accounts: accounts.length,
    authorised: accounts.filter((account) => account.isAuthorized).length,
    pendingAccounts: accounts.filter((account) => !account.isAuthorized).length,
    pendingPosts: posts.filter((post) => post.status === "pending").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Workspace Summary */}
        <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Discuss Workspace
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Discuss Accounts & Moderation
              </h1>
              <p className="mt-2 text-sm text-slate-600 font-semibold leading-relaxed">
                Manage verified club identities, review who is posting, and moderate what goes live on the network board.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <a
                href="/discuss?clubAccount=true"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Club
              </a>
              <div className="grid shrink-0 gap-3 sm:grid-cols-4">
                <StatCard label="Accounts" value={stats.accounts} />
                <StatCard label="Verified" value={stats.authorised} />
                <StatCard label="Pending Accounts" value={stats.pendingAccounts} />
                <StatCard label="Pending Posts" value={stats.pendingPosts} />
              </div>
            </div>
          </div>
        </section>

        <AdminSectionTabs
          active={activeSection}
          onChange={setActiveSection}
          tabs={[
            { id: "clubs", label: "Club Identities", icon: ShieldCheck, count: accounts.length },
            { id: "posts", label: "Discuss Posts", icon: Newspaper, count: posts.length },
          ]}
        />

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
                <CheckCircle2 size={16} />
                {success}
              </div>
            )}
          </div>
        )}

        {/* Discuss Accounts Section */}
        {activeSection === "clubs" && <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Club Identities</h2>
              <p className="text-xs text-slate-500 font-semibold">Verify and moderate discuss account credentials</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            </div>
          ) : accounts.length === 0 ? (
            <p className="py-4 text-sm font-semibold text-slate-400">No discuss accounts found.</p>
          ) : (
            <div className="overflow-x-auto rounded-[1.15rem] border border-slate-200">
              <div className="min-w-[1100px]">
                <div className="grid grid-cols-[minmax(240px,1.2fr)_minmax(180px,0.85fr)_160px_170px_minmax(260px,1fr)] border-b border-slate-200 bg-slate-50/80 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <div>Club</div>
                  <div>Contact</div>
                  <div>Role</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>
                {accounts.map((account) => (
                  <div key={account._id} className="grid grid-cols-[minmax(240px,1.2fr)_minmax(180px,0.85fr)_160px_170px_minmax(260px,1fr)] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900">{account.clubName}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {account.collegeName}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Newspaper className="h-3.5 w-3.5" />
                          {getPostCount(account)} posts
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 text-sm">
                      <div className="font-semibold text-slate-900">{account.contactName}</div>
                      <div className="truncate text-xs text-slate-500">{account.email || account.contactPhone || "No contact"}</div>
                    </div>
                    <div>
                      <select
                        value={account.role}
                        onChange={(e) => updateAccount(account._id, { role: e.target.value as any })}
                        disabled={savingId === account._id}
                        className="w-full rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-600"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>{role.replace("_", " ")}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 ${
                        account.isAuthorized ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100"
                      }`}>
                        {account.badgeLabel || (account.isAuthorized ? "Verified" : "Pending")}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {account.website && (
                        <a href={account.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-700">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Link
                        </a>
                      )}
                      <button
                        type="button"
                        disabled={savingId === account._id}
                        onClick={() => updateAccount(account._id, {
                          isAuthorized: !account.isAuthorized,
                          badgeLabel: !account.isAuthorized ? account.badgeLabel || "Verified by network" : "Pending verification",
                        })}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                      >
                        <UserCog className="h-3.5 w-3.5" />
                        {account.isAuthorized ? "Deauthorize" : "Verify"}
                      </button>
                      <button
                        type="button"
                        disabled={savingId === account._id}
                        onClick={() => deleteAccount(account._id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>}

        {/* Discuss Posts Section */}
        {activeSection === "posts" && <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Discuss Boards Moderation</h2>
              <p className="text-xs text-slate-500 font-semibold">Review, approve, or reject user posts</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
              <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm font-semibold text-slate-400 py-4">No discuss posts found.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article key={post._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill status={post.status} />
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">
                          {post.type}
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">
                          {post.collegeName}
                        </span>
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">
                          {post.clubName}
                        </span>
                        {post.isAuthorisedPost && (
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                            {post.badgeLabel || "Verified Post"}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                      <p className="text-sm leading-relaxed text-slate-600 font-semibold">{post.description}</p>
                      
                      {post.banner?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.banner.url}
                          alt={post.title}
                          className="h-44 w-full rounded-2xl object-cover ring-1 ring-slate-200 shadow-sm"
                        />
                      )}

                      <p className="text-xs text-slate-500 font-semibold">
                        Submitted by: {post.contactName || "Unknown"} 
                        {post.contactPhone ? ` · Contact: ${post.contactPhone}` : ""}
                        {post.contactEmail ? ` · Email: ${post.contactEmail}` : ""}
                        {post.createdAt && ` · Posted: ${new Date(post.createdAt).toLocaleDateString()}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={savingId === post._id}
                          onClick={() => updateStatus(post._id, status)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                            post.status === status
                              ? "bg-slate-900 text-white"
                              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {status}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={savingId === post._id}
                        onClick={() => deletePost(post._id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>}
      </div>
    </AdminLayout>
  );
}
