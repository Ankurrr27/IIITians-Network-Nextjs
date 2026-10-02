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
  Pin,
  Pencil,
  Save,
  X,
  Expand,
} from "lucide-react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { IDiscussPost, IDiscussAccount } from "@/types";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";

const statusOptions = ["pending", "approved", "rejected"];
const roleOptions = ["club_member", "club_manager", "publisher"];
const postTypeOptions: IDiscussPost["type"][] = ["announcement", "event", "campaign", "collaboration", "opportunity"];

interface PostEditForm {
  title: string;
  description: string;
  type: IDiscussPost["type"];
  collegeName: string;
  clubName: string;
  eventDate: string;
  actionLink: string;
}

interface ClubEditForm {
  clubName: string;
  collegeName: string;
  contactName: string;
  contactPhone: string;
  email: string;
  website: string;
}

const emptyPostEditForm: PostEditForm = {
  title: "",
  description: "",
  type: "announcement",
  collegeName: "",
  clubName: "",
  eventDate: "",
  actionLink: "",
};

const emptyClubEditForm: ClubEditForm = {
  clubName: "",
  collegeName: "",
  contactName: "",
  contactPhone: "",
  email: "",
  website: "",
};

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

function getPostCollegeName(post: IDiscussPost): string {
  const accountCollegeName = typeof post.account === "object" ? post.account?.collegeName?.trim() : "";
  return accountCollegeName || post.collegeName || "";
}

export default function DiscussAdminPage() {
  const [posts, setPosts] = useState<IDiscussPost[] | any[]>([]);
  const [accounts, setAccounts] = useState<IDiscussAccount[]>([]);
  const [activeSection, setActiveSection] = useState<"clubs" | "posts">("clubs");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingPost, setEditingPost] = useState<IDiscussPost | null>(null);
  const [postEditForm, setPostEditForm] = useState<PostEditForm>(emptyPostEditForm);
  const [editingClub, setEditingClub] = useState<IDiscussAccount | null>(null);
  const [clubEditForm, setClubEditForm] = useState<ClubEditForm>(emptyClubEditForm);
  const [previewBanner, setPreviewBanner] = useState<{ url: string; title: string } | null>(null);

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

  const updatePostPin = async (id: string, isPinned: boolean) => {
    setSavingId(id);
    setError("");
    setSuccess("");
    try {
      const response = await api.patch(`/discuss/${id}`, { isPinned });
      setPosts((prev) => prev.map((post) => (post._id === id ? response.data : post)));
      setSuccess(isPinned ? "Post pinned." : "Post unpinned.");
    } catch (err: any) {
      setError("Could not update discuss post pin status.");
    } finally {
      setSavingId("");
    }
  };

  const updatePostFeatured = async (id: string, isFeatured: boolean) => {
    setSavingId(id);
    setError("");
    setSuccess("");
    try {
      const response = await api.patch(`/discuss/${id}`, { isFeatured });
      setPosts((prev) => prev.map((post) => (post._id === id ? response.data : post)));
      setSuccess(isFeatured ? "Post added to the featured slideshow." : "Post removed from the featured slideshow.");
    } catch (err: any) {
      setError("Could not update discuss post feature status.");
    } finally {
      setSavingId("");
    }
  };

  const openPostEditor = (post: IDiscussPost) => {
    const eventDate = post.eventDate ? new Date(post.eventDate) : null;
    setEditingPost(post);
    setPostEditForm({
      title: post.title || "",
      description: post.description || "",
      type: post.type,
      collegeName: getPostCollegeName(post),
      clubName: post.clubName || "",
      eventDate: eventDate && !Number.isNaN(eventDate.getTime())
        ? new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
        : "",
      actionLink: post.actionLink || "",
    });
    setError("");
    setSuccess("");
  };

  const savePostEdits = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPost) return;
    setSavingId(editingPost._id);
    setError("");
    setSuccess("");
    try {
      const response = await api.patch(`/discuss/${editingPost._id}`, {
        ...postEditForm,
        eventDate: postEditForm.eventDate || null,
      });
      setPosts((prev) => prev.map((post) => (post._id === editingPost._id ? response.data : post)));
      setEditingPost(null);
      setSuccess("Discuss post updated.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not update discuss post.");
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

  const updateAccount = async (id: string, updates: Partial<IDiscussAccount>): Promise<boolean> => {
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
      return true;
    } catch (err: any) {
      setError("Could not update discuss account.");
      return false;
    } finally {
      setSavingId("");
    }
  };

  const openClubEditor = (account: IDiscussAccount) => {
    setEditingPost(null);
    setEditingClub(account);
    setClubEditForm({
      clubName: account.clubName || "",
      collegeName: account.collegeName || "",
      contactName: account.contactName || "",
      contactPhone: account.contactPhone || "",
      email: account.email || "",
      website: account.website || "",
    });
    setError("");
    setSuccess("");
  };

  const saveClubEdits = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingClub) return;
    const updated = await updateAccount(editingClub._id, clubEditForm);
    if (updated) setEditingClub(null);
  };

  const openBannerPreview = (url: string, title: string) => {
    setPreviewBanner({ url, title });
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
      (post) => {
        const postAccountId = typeof post.account === "string" ? post.account : post.account?._id;
        if (postAccountId) return postAccountId === account._id;
        return (post.clubName || "").trim().toLowerCase() === (account.clubName || "").trim().toLowerCase() &&
          (post.collegeName || "").trim().toLowerCase() === (account.collegeName || "").trim().toLowerCase();
      }
    ).length;

  const stats = {
    accounts: accounts.length,
    authorised: accounts.filter((account) => account.isAuthorized).length,
    pendingAccounts: accounts.filter((account) => !account.isAuthorized).length,
    pendingPosts: posts.filter((post) => post.status === "pending").length,
    pinnedPosts: posts.filter((post) => post.isPinned).length,
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const adminPinnedPosts = sortedPosts.filter((p) => p.isPinned);
  const adminRegularPosts = sortedPosts.filter((p) => !p.isPinned);

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
              <div className="grid shrink-0 gap-3 sm:grid-cols-5">
                <StatCard label="Accounts" value={stats.accounts} />
                <StatCard label="Verified" value={stats.authorised} />
                <StatCard label="Pending Accounts" value={stats.pendingAccounts} />
                <StatCard label="Pending Posts" value={stats.pendingPosts} />
                <StatCard label="Pinned Posts" value={stats.pinnedPosts} />
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
                      <button
                        type="button"
                        disabled={savingId === account._id}
                        onClick={() => openClubEditor(account)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
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
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Discuss Boards Moderation</h2>
                <p className="text-xs text-slate-500 font-semibold">Review, approve, reject · Pin posts to highlight them at the top of the public feed</p>
              </div>
            </div>
            {stats.pinnedPosts > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-300">
                <Pin className="h-3.5 w-3.5 fill-amber-500" />
                {stats.pinnedPosts} pinned
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
              <div className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm font-semibold text-slate-400 py-4">No discuss posts found.</p>
          ) : (
            <div className="space-y-6">

              {/* ── PINNED SECTION ── */}
              {adminPinnedPosts.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 ring-1 ring-amber-200">
                    <Pin className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="text-sm font-bold text-amber-700">Pinned Posts — visible at the top of the public discuss feed</span>
                    <span className="ml-auto rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">{adminPinnedPosts.length}</span>
                  </div>
                  <div className="space-y-3">
                    {adminPinnedPosts.map((post) => (
                      <article key={post._id} className="rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-5 space-y-4 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="max-w-3xl space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                                <Pin className="h-3.5 w-3.5 fill-white" /> Pinned
                              </span>
                              <StatusPill status={post.status} />
                              <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">{post.type}</span>
                              <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">{getPostCollegeName(post)}</span>
                              <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">{post.clubName}</span>
                              {post.isAuthorisedPost && (
                                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">{post.badgeLabel || "Verified Post"}</span>
                              )}
                              {post.isFeatured && <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">Featured</span>}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                            <p className="text-sm leading-relaxed text-slate-600 font-semibold">{post.description}</p>
                            {post.banner?.url && (
                              <button type="button" onClick={() => openBannerPreview(post.banner!.url!, post.title)} className="group relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950 ring-1 ring-amber-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={post.banner.url} alt={post.title} className="h-full w-full object-contain" />
                                {post.isFeatured && <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg"><Sparkles className="h-3.5 w-3.5" /> Featured slideshow</span>}
                                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-950/75 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                                  <Expand className="h-3.5 w-3.5" /> View full banner
                                </span>
                              </button>
                            )}
                            <p className="text-xs text-slate-500 font-semibold">
                              Submitted by: {post.contactName || "Unknown"}
                              {post.contactPhone ? ` · Contact: ${post.contactPhone}` : ""}
                              {post.contactEmail ? ` · Email: ${post.contactEmail}` : ""}
                              {post.createdAt && ` · Posted: ${new Date(post.createdAt).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <div className="flex flex-wrap gap-2">
                              {statusOptions.map((status) => (
                                <button key={status} type="button" disabled={savingId === post._id} onClick={() => updateStatus(post._id, status)}
                                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                                    post.status === status ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                                  }`}>{status}</button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button type="button" disabled={savingId === post._id} onClick={() => openPostEditor(post)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-50">
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button type="button" disabled={savingId === post._id}
                                onClick={() => updatePostFeatured(post._id, !post.isFeatured)}
                                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition cursor-pointer disabled:opacity-50 ${post.isFeatured ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-white text-sky-700 ring-1 ring-sky-200 hover:bg-sky-50"}`}>
                                <Sparkles className="h-4 w-4" /> {post.isFeatured ? "Unfeature" : "Feature"}
                              </button>
                              <button type="button" disabled={savingId === post._id}
                                onClick={() => updatePostPin(post._id, false)}
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600 cursor-pointer disabled:opacity-50">
                                <Pin className="h-4 w-4 fill-white" /> Unpin Post
                              </button>
                              <button type="button" disabled={savingId === post._id} onClick={() => deletePost(post._id)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* ── ALL OTHER POSTS ── */}
              {adminRegularPosts.length > 0 && (
                <div>
                  {adminPinnedPosts.length > 0 && (
                    <div className="mb-3 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 ring-1 ring-slate-200">
                      <Sparkles className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-500">Unpinned Posts — shown in the regular feed</span>
                      <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">{adminRegularPosts.length}</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    {adminRegularPosts.map((post) => (
                      <article key={post._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="max-w-3xl space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusPill status={post.status} />
                              <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">{post.type}</span>
                              <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">{getPostCollegeName(post)}</span>
                              <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200">{post.clubName}</span>
                              {post.isAuthorisedPost && (
                                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">{post.badgeLabel || "Verified Post"}</span>
                              )}
                              {post.isFeatured && <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">Featured</span>}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
                            <p className="text-sm leading-relaxed text-slate-600 font-semibold">{post.description}</p>
                            {post.banner?.url && (
                              <button type="button" onClick={() => openBannerPreview(post.banner!.url!, post.title)} className="group relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950 ring-1 ring-slate-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={post.banner.url} alt={post.title} className="h-full w-full object-contain" />
                                {post.isFeatured && <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg"><Sparkles className="h-3.5 w-3.5" /> Featured slideshow</span>}
                                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-950/75 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                                  <Expand className="h-3.5 w-3.5" /> View full banner
                                </span>
                              </button>
                            )}
                            <p className="text-xs text-slate-500 font-semibold">
                              Submitted by: {post.contactName || "Unknown"}
                              {post.contactPhone ? ` · Contact: ${post.contactPhone}` : ""}
                              {post.contactEmail ? ` · Email: ${post.contactEmail}` : ""}
                              {post.createdAt && ` · Posted: ${new Date(post.createdAt).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <div className="flex flex-wrap gap-2">
                              {statusOptions.map((status) => (
                                <button key={status} type="button" disabled={savingId === post._id} onClick={() => updateStatus(post._id, status)}
                                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                                    post.status === status ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                                  }`}>{status}</button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button type="button" disabled={savingId === post._id} onClick={() => openPostEditor(post)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-50">
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button type="button" disabled={savingId === post._id}
                                onClick={() => updatePostFeatured(post._id, !post.isFeatured)}
                                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition cursor-pointer disabled:opacity-50 ${post.isFeatured ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-white text-sky-700 ring-1 ring-sky-200 hover:bg-sky-50"}`}>
                                <Sparkles className="h-4 w-4" /> {post.isFeatured ? "Unfeature" : "Feature"}
                              </button>
                              <button type="button" disabled={savingId === post._id}
                                onClick={() => updatePostPin(post._id, true)}
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-300 transition hover:bg-amber-50 hover:text-amber-700 hover:ring-amber-300 cursor-pointer disabled:opacity-50">
                                <Pin className="h-4 w-4" /> Pin to Top
                              </button>
                              <button type="button" disabled={savingId === post._id} onClick={() => deletePost(post._id)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </section>}

        {editingPost && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <section role="dialog" aria-modal="true" aria-labelledby="edit-discuss-post-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 id="edit-discuss-post-title" className="text-xl font-bold text-slate-900">Edit Discuss Post</h2>
                  <p className="mt-1 text-sm text-slate-500">Update post details shown on the public board.</p>
                </div>
                <button type="button" onClick={() => setEditingPost(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close editor">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={savePostEdits} className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Title
                  <input required value={postEditForm.title} onChange={(event) => setPostEditForm((form) => ({ ...form, title: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" />
                </label>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description
                  <textarea rows={5} value={postEditForm.description} onChange={(event) => setPostEditForm((form) => ({ ...form, description: event.target.value }))} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    College name
                    <input value={postEditForm.collegeName} onChange={(event) => setPostEditForm((form) => ({ ...form, collegeName: event.target.value }))} placeholder="Leave blank to remove" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" />
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Club / publisher
                    <input value={postEditForm.clubName} onChange={(event) => setPostEditForm((form) => ({ ...form, clubName: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" />
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Post type
                    <select value={postEditForm.type} onChange={(event) => setPostEditForm((form) => ({ ...form, type: event.target.value as IDiscussPost["type"] }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium capitalize text-slate-900 outline-none focus:border-indigo-500 focus:bg-white">
                      {postTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Event date
                    <input type="date" value={postEditForm.eventDate} onChange={(event) => setPostEditForm((form) => ({ ...form, eventDate: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" />
                  </label>
                </div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Action link
                  <input type="url" value={postEditForm.actionLink} onChange={(event) => setPostEditForm((form) => ({ ...form, actionLink: event.target.value }))} placeholder="https://..." className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" />
                </label>
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setEditingPost(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={savingId === editingPost._id} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50">
                    <Save className="h-4 w-4" /> Save changes
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {editingClub && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <section role="dialog" aria-modal="true" aria-labelledby="edit-club-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 id="edit-club-title" className="text-xl font-bold text-slate-900">Edit Club Identity</h2>
                  <p className="mt-1 text-sm text-slate-500">Update the public club name and account contact details.</p>
                </div>
                <button type="button" onClick={() => setEditingClub(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close editor">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={saveClubEdits} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Club name
                    <input required value={clubEditForm.clubName} onChange={(event) => setClubEditForm((form) => ({ ...form, clubName: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" />
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    College
                    <input required value={clubEditForm.collegeName} onChange={(event) => setClubEditForm((form) => ({ ...form, collegeName: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" />
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contact name
                    <input required value={clubEditForm.contactName} onChange={(event) => setClubEditForm((form) => ({ ...form, contactName: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" />
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contact phone
                    <input value={clubEditForm.contactPhone} onChange={(event) => setClubEditForm((form) => ({ ...form, contactPhone: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" />
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email
                    <input required type="email" value={clubEditForm.email} onChange={(event) => setClubEditForm((form) => ({ ...form, email: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" />
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Website
                    <input type="url" value={clubEditForm.website} onChange={(event) => setClubEditForm((form) => ({ ...form, website: event.target.value }))} placeholder="https://..." className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" />
                  </label>
                </div>
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setEditingClub(null)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={savingId === editingClub._id} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50">
                    <Save className="h-4 w-4" /> Save club
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {previewBanner && (
          <div className="fixed inset-0 z-110 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm" onClick={() => setPreviewBanner(null)}>
            <section role="dialog" aria-modal="true" aria-label={`Banner preview: ${previewBanner.title}`} onClick={(event) => event.stopPropagation()} className="w-full max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-2xl">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-white sm:px-5">
                <h2 className="truncate text-sm font-semibold">{previewBanner.title}</h2>
                <button type="button" onClick={() => setPreviewBanner(null)} className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Close banner preview">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex max-h-[82vh] min-h-48 items-center justify-center p-3 sm:p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewBanner.url} alt={previewBanner.title} className="max-h-[76vh] max-w-full object-contain" />
              </div>
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
