"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import api from "@/lib/apiClient";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Megaphone, Plus, LogIn, LogOut, UserPlus, Send,
  ShieldCheck, MapPin, User, Mail, Phone, Trash2, Image as ImageIcon,
} from "lucide-react";
import type { IDiscussPost, IDiscussAccount } from "@/types";
import DiscussCard from "@/components/discuss/DiscussCard";
import ImageCropModal from "@/components/ImageCropModal";

const POST_TYPES = ["announcement", "event", "campaign", "collaboration", "opportunity"] as const;

const INIT_POST = { title: "", description: "", type: "announcement" as string, actionLink: "", eventDate: "" };
const INIT_LOGIN = { handle: "", password: "" };
const INIT_REG = { collegeName: "", clubName: "", contactName: "", contactPhone: "", website: "", handle: "", password: "" };

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/80 px-4 py-4 ring-1 ring-sky-100">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Message({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <p className={`rounded-2xl border px-4 py-3 text-sm ${tone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      {children}
    </p>
  );
}

export default function DiscussPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
      </div>
    }>
      <DiscussPageClient />
    </Suspense>
  );
}

function DiscussPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<IDiscussPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<IDiscussAccount | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [myPosts, setMyPosts] = useState<IDiscussPost[]>([]);
  const [panelMode, setPanelMode] = useState<"" | "composer" | "auth">("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [editingId, setEditingId] = useState("");
  const [postForm, setPostForm] = useState(INIT_POST);
  const [loginForm, setLoginForm] = useState(INIT_LOGIN);
  const [regForm, setRegForm] = useState(INIT_REG);
  const [postState, setPostState] = useState({ loading: false, error: "", success: "" });
  const [authState, setAuthState] = useState({ loading: false, error: "", success: "" });
  const [colleges, setColleges] = useState<string[]>([]);
  const [postPhotos, setPostPhotos] = useState<File[]>([]);
  const [rawCropFile, setRawCropFile] = useState<File | null>(null);
  const [clubHandles, setClubHandles] = useState<string[]>([]);

  const stats = useMemo(() => ({
    total: posts.length,
    colleges: new Set(posts.map((p) => p.collegeName).filter(Boolean)).size,
    clubs: new Set(posts.map((p) => `${p.collegeName}::${p.clubName}`).filter(Boolean)).size,
  }), [posts]);

  const loadPosts = async () => {
    setLoading(true);
    try { setPosts((await api.get("/discuss")).data || []); } finally { setLoading(false); }
  };

  const setClubAccountQuery = (open: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (open) params.set("clubAccount", "true");
    else params.delete("clubAccount");
    const query = params.toString();
    router.replace(query ? `/discuss?${query}` : "/discuss", { scroll: false });
  };

  const openClubAccountPanel = () => {
    setPanelMode("auth");
    setClubAccountQuery(true);
  };

  const loadAccount = async () => {
    const token = localStorage.getItem("discussToken");
    if (!token) { setAccount(null); setMyPosts([]); setAccountLoading(false); return; }
    setAccountLoading(true);
    try {
      const [accRes, myRes] = await Promise.all([
        api.get("/discuss-accounts/me", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/discuss/mine", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setAccount(accRes.data);
      setMyPosts(myRes.data || []);
    } catch { localStorage.removeItem("discussToken"); setAccount(null); setMyPosts([]); }
    finally { setAccountLoading(false); }
  };

  useEffect(() => {
    loadPosts();
    loadAccount();
    api.get("/colleges").then((r) => setColleges((r.data || []).map((c: { name: string }) => c.name)));
    api.get("/discuss-accounts/handles").then((r) => setClubHandles(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get("clubAccount") === "true") {
      setPanelMode("auth");
    }
  }, [searchParams]);

  const closePanel = () => {
    setPanelMode("");
    setEditingId("");
    setPostForm(INIT_POST);
    setPostPhotos([]);
    setClubAccountQuery(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthState({ loading: true, error: "", success: "" });
    try {
      const r = await api.post("/discuss-accounts/login", loginForm);
      localStorage.setItem("discussToken", r.data.token);
      await loadAccount();
      setAuthState({ loading: false, error: "", success: "Logged in!" });
      setPanelMode("");
    } catch (err: unknown) {
      setAuthState({ loading: false, success: "", error: (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Login failed." });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthState({ loading: true, error: "", success: "" });
    try {
      await api.post("/discuss-accounts/register", regForm);
      setRegForm(INIT_REG);
      setAuthMode("login");
      setAuthState({ loading: false, error: "", success: "Request created! Await admin approval before logging in." });
    } catch (err: unknown) {
      setAuthState({ loading: false, success: "", error: (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Registration failed." });
    }
  };

  const handleLogout = () => { localStorage.removeItem("discussToken"); setAccount(null); setMyPosts([]); closePanel(); };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("discussToken");
    if (!token) return;
    setPostState({ loading: true, error: "", success: "" });
    try {
      const fd = new FormData();
      Object.entries(postForm).forEach(([k, v]) => fd.append(k, v));
      postPhotos.forEach(f => fd.append("photos", f));
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" };
      if (editingId) await api.patch(`/discuss/mine/${editingId}`, fd, { headers });
      else await api.post("/discuss", fd, { headers });
      closePanel();
      await Promise.all([loadPosts(), loadAccount()]);
      setPostState({ loading: false, error: "", success: editingId ? "Post updated." : "Submitted for review." });
    } catch (err: unknown) {
      setPostState({ loading: false, success: "", error: (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to save." });
    }
  };

  const handleDeletePost = async (id: string) => {
    const token = localStorage.getItem("discussToken");
    if (!token || !confirm("Delete this post?")) return;
    await api.delete(`/discuss/mine/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    await Promise.all([loadPosts(), loadAccount()]);
  };

  const input = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100";

  return (
    <section className="relative min-h-screen bg-[linear-gradient(180deg,_#eef7ff_0%,_#f7fbff_36%,_#f9fcff_100%)] pb-12 pt-[4.5rem]">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm">
              <Megaphone className="h-4 w-4" /> Discuss Board
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Network-wide updates from clubs &amp; communities.
            </h1>
            <p className="mt-3 text-sm text-slate-500">Clubs can post updates, announcements, events and collaboration opportunities.</p>
          </div>

          {/* Account panel */}
          <div className="rounded-xl border border-sky-100 bg-white/70 p-3.5 shadow-sm xl:w-full xl:max-w-sm">
            {accountLoading ? (
              <p className="text-sm text-slate-500">Restoring discuss account…</p>
            ) : account ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">
                    <ShieldCheck className="h-3.5 w-3.5" /> {account.clubName}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${account.isAuthorized ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {account.isAuthorized ? account.badgeLabel || "Verified" : "Pending verification"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{account.collegeName}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingId(""); setPostForm(INIT_POST); setPostState({ loading: false, error: "", success: "" }); setPanelMode("composer"); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700">
                    <Plus className="h-4 w-4" /> Post update
                  </button>
                  <button onClick={openClubAccountPanel}
                    className="rounded-full border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-sky-50">
                    Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Register your club once, then post from the same account.</p>
                <div className="flex gap-2">
                  <button onClick={openClubAccountPanel} className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-sky-50">
                    <LogIn className="h-4 w-4" /> Club account
                  </button>
                  <Link href="/guide" className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition hover:bg-sky-100">
                    Guide
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <StatCard label="Live updates" value={stats.total} />
          <StatCard label="Colleges active" value={stats.colleges} />
          <StatCard label="Communities posting" value={stats.clubs} />
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" /></div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-sky-100 bg-white/90 px-5 py-10 text-center text-sm text-slate-500">
              No live updates yet. The first approved club announcement will appear here.
            </div>
          ) : (
            posts.filter((p) => p.status === "approved").map((post) => (
              <DiscussCard key={post._id} post={post} />
            ))
          )}
        </div>
      </div>

      {/* Slide Panel */}
      {panelMode && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={closePanel}>
          <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h2 className="font-bold text-slate-900">{panelMode === "composer" ? (editingId ? "Edit post" : "Post update") : "Club account"}</h2>
              <button onClick={closePanel} className="rounded-full p-2 text-slate-400 hover:bg-slate-50">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {panelMode === "composer" ? (
                <>
                  {postState.error && <Message tone="error">{postState.error}</Message>}
                  {postState.success && <Message tone="success">{postState.success}</Message>}
                  <form onSubmit={handleSubmitPost} className="space-y-4">
                    <input required placeholder="Title" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} className={input} />
                    <select value={postForm.type} onChange={(e) => setPostForm({ ...postForm, type: e.target.value })} className={input}>
                      {POST_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <input placeholder="Action link (optional)" value={postForm.actionLink} onChange={(e) => setPostForm({ ...postForm, actionLink: e.target.value })} className={input} />
                    {postForm.type === "event" && (
                      <input type="date" required value={postForm.eventDate} onChange={(e) => setPostForm({ ...postForm, eventDate: e.target.value })} className={input} />
                    )}
                    <textarea required rows={6} placeholder="Description…" value={postForm.description} onChange={(e) => setPostForm({ ...postForm, description: e.target.value })} className={`${input} resize-none`} />
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Attach Images</label>
                      <div className="flex flex-wrap gap-2">
                        {postPhotos.map((f, i) => (
                          <div key={i} className="relative h-16 w-16 rounded-xl overflow-hidden ring-1 ring-slate-200">
                            <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                            <button type="button" onClick={() => setPostPhotos(ps => ps.filter((_, j) => j !== i))} className="absolute -right-1 -top-1 rounded-full bg-rose-500 p-0.5 text-white"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        ))}
                        <button type="button" onClick={() => document.getElementById("discuss-photo-input")?.click()} className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-sky-400 hover:text-sky-500 transition"><ImageIcon className="h-5 w-5" /></button>
                        <input id="discuss-photo-input" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setRawCropFile(f); e.target.value = ""; }} />
                      </div>
                    </div>
                    <button type="submit" disabled={postState.loading} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                      <Send className="h-4 w-4" /> {postState.loading ? "Saving…" : editingId ? "Save changes" : "Publish"}
                    </button>
                  </form>
                </>
              ) : account ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-bold text-indigo-600">{account.clubName[0]}</div>
                      <div>
                        <p className="font-bold text-slate-900">{account.clubName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {account.collegeName}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p className="flex items-center gap-1"><User className="h-3 w-3" /> {account.contactName}</p>
                      <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {account.email}</p>
                      {account.contactPhone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {account.contactPhone}</p>}
                    </div>
                  </div>

                  {myPosts.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">My Posts ({myPosts.length})</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                        {myPosts.map((p) => (
                          <div key={p._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                            <div>
                              <p className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">{p.title}</p>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.status === "approved" ? "bg-emerald-50 text-emerald-600" : p.status === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>{p.status}</span>
                                {p.createdAt && <span className="text-[10px] text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</span>}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => { setEditingId(p._id); setPostForm({ title: p.title, description: p.description, type: p.type, actionLink: p.actionLink || "", eventDate: p.eventDate ? String(p.eventDate).slice(0, 10) : "" }); setPanelMode("composer"); }} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-white">Edit</button>
                              <button onClick={() => handleDeletePost(p._id)} className="rounded-lg p-1 text-rose-400 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={handleLogout} className="w-full rounded-2xl bg-rose-50 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100 flex items-center justify-center gap-2">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <>
                  {authState.error && <Message tone="error">{authState.error}</Message>}
                  {authState.success && <Message tone="success">{authState.success}</Message>}
                  <div className="flex gap-2 rounded-full bg-slate-100 p-1">
                    {(["login", "register"] as const).map((m) => (
                      <button key={m} onClick={() => setAuthMode(m)} className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize transition ${authMode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>{m}</button>
                    ))}
                  </div>
                  {authMode === "login" ? (
                    <form onSubmit={handleLogin} className="space-y-3">
                      <input required placeholder="Club handle" list="club-handle-list" value={loginForm.handle} onChange={(e) => setLoginForm({ ...loginForm, handle: e.target.value })} className={input} />
                      <datalist id="club-handle-list">{clubHandles.map(h => <option key={h} value={h} />)}</datalist>
                      <input required type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className={input} />
                      <button type="submit" disabled={authState.loading} className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white disabled:opacity-60">
                        {authState.loading ? "Logging in…" : "Login"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-3">
                      <input required placeholder="College / IIIT" list="college-list" value={regForm.collegeName} onChange={(e) => setRegForm({ ...regForm, collegeName: e.target.value })} className={input} />
                      <datalist id="college-list">{colleges.map((c) => <option key={c} value={c} />)}</datalist>
                      <input required placeholder="Club / Society name" value={regForm.clubName} onChange={(e) => setRegForm({ ...regForm, clubName: e.target.value })} className={input} />
                      <input required placeholder="Contact name" value={regForm.contactName} onChange={(e) => setRegForm({ ...regForm, contactName: e.target.value })} className={input} />
                      <input placeholder="Contact phone" value={regForm.contactPhone} onChange={(e) => setRegForm({ ...regForm, contactPhone: e.target.value })} className={input} />
                      <input placeholder="Club website / Linktree" value={regForm.website} onChange={(e) => setRegForm({ ...regForm, website: e.target.value })} className={input} />
                      <input required placeholder="Club handle (e.g. ecellkota)" value={regForm.handle} onChange={(e) => setRegForm({ ...regForm, handle: e.target.value })} className={input} />
                      <input required type="password" placeholder="Password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} className={input} />
                      <button type="submit" disabled={authState.loading} className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2">
                        <UserPlus className="h-4 w-4" /> {authState.loading ? "Creating…" : "Create club account"}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      {account && !panelMode && (
        <button
          onClick={() => { setEditingId(""); setPostForm(INIT_POST); setPostState({ loading: false, error: "", success: "" }); setPanelMode("composer"); }}
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-xl shadow-sky-600/30 transition hover:bg-sky-700 active:scale-95 md:hidden"
          aria-label="New post"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Image Crop Modal */}
      {rawCropFile && (
        <ImageCropModal
          file={rawCropFile}
          aspect={16 / 9}
          onClose={() => setRawCropFile(null)}
          onCrop={(cropped) => { setPostPhotos(ps => [...ps, cropped]); setRawCropFile(null); }}
        />
      )}
    </section>
  );
}
