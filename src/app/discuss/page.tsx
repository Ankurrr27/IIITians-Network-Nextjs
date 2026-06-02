"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUp,
  AtSign,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  Clock,
  Edit3,
  Eye,
  Flame,
  Globe,
  Hash,
  HelpCircle,
  Image as ImageIcon,
  Link as LinkIcon,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Phone,
  Pin,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";
import api from "@/lib/apiClient";
import type { IDiscussAccount, IDiscussPost } from "@/types";

const POST_TYPES = ["announcement", "event", "campaign", "collaboration", "opportunity"] as const;
const TOPIC_FILTERS = ["For You", "Career", "Contest", "Club Help", "Collaboration", "Events"] as const;

const INIT_POST = {
  title: "",
  description: "",
  type: "announcement" as string,
  actionLink: "",
  eventDate: "",
};
const INIT_LOGIN = { handle: "", password: "" };
const INIT_REG = {
  collegeName: "",
  clubName: "",
  contactName: "",
  contactPhone: "",
  website: "",
  handle: "",
  password: "",
};
const INIT_QUERY = {
  title: "",
  body: "",
  category: "Club Help",
};

type QueryPost = {
  id: string;
  title: string;
  body: string;
  author: string;
  college: string;
  category: string;
  createdAt: string;
  replies: number;
  views: string;
  votes: number;
};

const starterQueries: QueryPost[] = [
  {
    id: "q-placement-roadmap",
    title: "Need a study circle for placement prep across IIITs",
    body: "Looking for people who want to revise DSA, core CS, aptitude, and interview stories together. Clubs can also share sessions or resources here.",
    author: "student_iiit",
    college: "IIIT Community",
    category: "Career",
    createdAt: "2 hours ago",
    replies: 8,
    views: "1.4K",
    votes: 31,
  },
  {
    id: "q-club-registration",
    title: "How can a new club post official announcements?",
    body: "Our club wants to share events and opportunities on the network. What details are needed for verification and approval?",
    author: "club_lead",
    college: "IIIT Network",
    category: "Club Help",
    createdAt: "5 hours ago",
    replies: 5,
    views: "620",
    votes: 18,
  },
  {
    id: "q-hackathon-team",
    title: "Open call for hackathon teammates this weekend",
    body: "Anyone interested in building a social impact project? Designers, backend folks, and ML beginners are welcome.",
    author: "hack_builder",
    college: "Cross-campus",
    category: "Collaboration",
    createdAt: "1 day ago",
    replies: 12,
    views: "2.1K",
    votes: 44,
  },
];

function Message({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <p className={`rounded-xl border px-4 py-3 text-sm ${tone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      {children}
    </p>
  );
}

function MetricPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}

function FeaturedClubCard({ post, index }: { post: IDiscussPost; index: number }) {
  const imageUrl = post.banner?.url || post.photos?.[0]?.url || "/IIITians-Network-Logo-Dark.png";
  const tones = [
    "from-slate-950 via-indigo-950 to-sky-800",
    "from-emerald-800 via-teal-800 to-slate-900",
    "from-violet-800 via-fuchsia-800 to-slate-950",
  ];

  return (
    <article className={`relative min-h-44 overflow-hidden rounded-xl bg-gradient-to-br ${tones[index % tones.length]} p-5 text-white shadow-sm`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className="absolute inset-y-0 right-0 h-full w-1/2 object-cover opacity-24 mix-blend-screen" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/14 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90 ring-1 ring-white/20">
            <Pin className="h-3.5 w-3.5" />
            {post.type}
          </span>
          <h2 className="mt-4 line-clamp-2 max-w-xs text-xl font-bold leading-tight">{post.title}</h2>
          <p className="mt-2 line-clamp-2 max-w-sm text-sm text-white/76">{post.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-xs font-semibold text-white/80">
          <span>{post.clubName}</span>
          <span>{post.collegeName}</span>
        </div>
      </div>
    </article>
  );
}

function OfficialPostRow({ post }: { post: IDiscussPost }) {
  const images = [
    ...(post.banner?.url ? [post.banner] : []),
    ...(post.photos || []),
  ].filter((image, index, list) => image?.url && list.findIndex((item) => item?.url === image.url) === index);
  const coverUrl = images[0]?.url;
  const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent";

  return (
    <article className="border-b border-slate-200 py-6">
      <div className="flex gap-4">
        <div className="hidden pt-1 sm:block">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
            <Megaphone className="h-5 w-5" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{post.clubName}</span>
            {post.badgeLabel && <BadgeCheck className="h-4 w-4 fill-sky-500 text-white" />}
            <span>{post.collegeName}</span>
            <span>{date}</span>
          </div>
          <h3 className="mt-2 text-xl font-bold leading-snug text-slate-950">{post.title}</h3>
          <p className="mt-3 line-clamp-3 text-base leading-7 text-slate-600">
            {post.description.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
              const match = part.match(/\[(.*?)\]\((.*?)\)/);
              if (match) {
                return (
                  <a key={i} href={match[2]} target="_blank" rel="noreferrer" className="font-bold text-indigo-600 hover:underline">
                    {match[1]}
                  </a>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><ArrowUp className="h-4 w-4" /> {Math.max(12, post.title.length + post.clubName.length)}</span>
            <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {Math.max(240, post.description.length * 7).toLocaleString("en-IN")}</span>
            <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> Official</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">{post.type}</span>
          </div>
          {post.actionLink && (
            <a href={post.actionLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800">
              Open link <LinkIcon className="h-4 w-4" />
            </a>
          )}
        </div>
        {coverUrl && (
          <a href={coverUrl} target="_blank" rel="noreferrer" className="hidden h-28 w-44 shrink-0 overflow-hidden rounded-xl bg-slate-100 md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt={post.title} className="h-full w-full object-cover transition hover:scale-105" />
          </a>
        )}
      </div>
    </article>
  );
}

function QueryRow({ query }: { query: QueryPost }) {
  return (
    <article className="border-b border-slate-200 py-6">
      <div className="flex gap-4">
        <div className="hidden pt-1 sm:block">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-600 ring-1 ring-slate-200">
            <HelpCircle className="h-5 w-5" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{query.author}</span>
            <span>{query.college}</span>
            <span>{query.createdAt}</span>
          </div>
          <h3 className="mt-2 text-xl font-bold leading-snug text-slate-950">{query.title}</h3>
          <p className="mt-3 text-base leading-7 text-slate-600">{query.body}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><ArrowUp className="h-4 w-4" /> {query.votes}</span>
            <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {query.views}</span>
            <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {query.replies}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">#{query.category}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function DiscussPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
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
  const [queryForm, setQueryForm] = useState(INIT_QUERY);
  const [queries, setQueries] = useState<QueryPost[]>(starterQueries);
  const [activeTopic, setActiveTopic] = useState<(typeof TOPIC_FILTERS)[number]>("For You");
  const [search, setSearch] = useState("");
  const [postState, setPostState] = useState({ loading: false, error: "", success: "" });
  const [authState, setAuthState] = useState({ loading: false, error: "", success: "" });
  const [queryState, setQueryState] = useState("");
  const [colleges, setColleges] = useState<string[]>([]);
  const [postPhotos, setPostPhotos] = useState<File[]>([]);
  const [rawCropFile, setRawCropFile] = useState<File | null>(null);
  const [clubHandles, setClubHandles] = useState<string[]>([]);

  const approvedPosts = useMemo(() => posts.filter((p) => p.status === "approved"), [posts]);
  const featuredPosts = useMemo(() => approvedPosts.slice(0, 3), [approvedPosts]);

  const stats = useMemo(() => ({
    total: approvedPosts.length + queries.length,
    colleges: new Set(approvedPosts.map((p) => p.collegeName).filter(Boolean)).size,
    clubs: new Set(approvedPosts.map((p) => `${p.collegeName}::${p.clubName}`).filter(Boolean)).size,
  }), [approvedPosts, queries.length]);

  const filteredOfficialPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return approvedPosts.filter((post) => {
      const topicMatch = activeTopic === "For You" || post.type === "event" && activeTopic === "Events" || post.type === "collaboration" && activeTopic === "Collaboration";
      const searchMatch = !q || [post.title, post.description, post.clubName, post.collegeName, post.type].join(" ").toLowerCase().includes(q);
      return topicMatch && searchMatch;
    });
  }, [activeTopic, approvedPosts, search]);

  const filteredQueries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return queries.filter((query) => {
      const topicMatch = activeTopic === "For You" || query.category === activeTopic;
      const searchMatch = !q || [query.title, query.body, query.author, query.college, query.category].join(" ").toLowerCase().includes(q);
      return topicMatch && searchMatch;
    });
  }, [activeTopic, queries, search]);

  const exploreItems = useMemo(() => [
    ...approvedPosts.slice(0, 4).map((post) => ({
      id: post._id,
      label: post.type,
      title: post.title,
      subtitle: post.clubName,
    })),
    ...queries.slice(0, 3).map((query) => ({
      id: query.id,
      label: query.category,
      title: query.title,
      subtitle: `${query.replies} replies`,
    })),
  ].slice(0, 6), [approvedPosts, queries]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      setPosts((await api.get("/discuss")).data || []);
    } finally {
      setLoading(false);
    }
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

  const openComposer = () => {
    setEditingId("");
    setPostForm(INIT_POST);
    setPostState({ loading: false, error: "", success: "" });
    setPanelMode("composer");
  };

  const loadAccount = async () => {
    const token = localStorage.getItem("discussToken");
    if (!token) {
      setAccount(null);
      setMyPosts([]);
      setAccountLoading(false);
      return;
    }
    setAccountLoading(true);
    try {
      const [accRes, myRes] = await Promise.all([
        api.get("/discuss-accounts/me", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/discuss/mine", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setAccount(accRes.data);
      setMyPosts(myRes.data || []);
    } catch {
      localStorage.removeItem("discussToken");
      setAccount(null);
      setMyPosts([]);
    } finally {
      setAccountLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    loadAccount();
    api.get("/colleges").then((r) => setColleges((r.data || []).map((c: { name: string }) => c.name)));
    api.get("/discuss-accounts/handles").then((r) => setClubHandles(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get("clubAccount") === "true") setPanelMode("auth");
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

  const handleLogout = () => {
    localStorage.removeItem("discussToken");
    setAccount(null);
    setMyPosts([]);
    closePanel();
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("discussToken");
    if (!token) return;
    setPostState({ loading: true, error: "", success: "" });
    try {
      const fd = new FormData();
      Object.entries(postForm).forEach(([k, v]) => fd.append(k, v));
      postPhotos.forEach((f) => fd.append("photos", f));
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

  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryForm.title.trim() || !queryForm.body.trim()) return;
    const newQuery: QueryPost = {
      id: `q-${Date.now()}`,
      title: queryForm.title.trim(),
      body: queryForm.body.trim(),
      author: "you",
      college: "IIIT Community",
      category: queryForm.category,
      createdAt: "just now",
      replies: 0,
      views: "1",
      votes: 1,
    };
    setQueries((current) => [newQuery, ...current]);
    setQueryForm(INIT_QUERY);
    setQueryState("Your query is live in this page. Connect it to a backend when you want persistence.");
    window.setTimeout(() => setQueryState(""), 3500);
  };

  const handleDeletePost = async (id: string) => {
    const token = localStorage.getItem("discussToken");
    if (!token || !confirm("Delete this post?")) return;
    await api.delete(`/discuss/mine/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    await Promise.all([loadPosts(), loadAccount()]);
  };

  const input = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  return (
    <section className="min-h-screen bg-[#f5f7fb] pt-[4.5rem] text-slate-950">
      <div className="border-b border-slate-200 bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              <Sparkles className="h-4 w-4" />
              IIITians Discuss
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">Ask, answer, and follow club updates.</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search discussions" className={`${input} bg-slate-100 pl-10`} />
            </div>
            {account ? (
              <button onClick={openComposer} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">
                <Edit3 className="h-4 w-4" />
                Create
              </button>
            ) : (
              <button onClick={openClubAccountPanel} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
                <LogIn className="h-4 w-4" />
                Club login
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:px-6">
        <main className="min-w-0">
          <div className="grid gap-4 md:grid-cols-3">
            {featuredPosts.length > 0 ? featuredPosts.map((post, index) => <FeaturedClubCard key={post._id} post={post} index={index} />) : (
              <>
                <div className="rounded-xl bg-gradient-to-br from-slate-950 via-indigo-950 to-sky-800 p-5 text-white">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/70">Club posts</p>
                  <h2 className="mt-4 text-xl font-bold">Official updates appear here first</h2>
                  <p className="mt-2 text-sm text-white/72">Announcements, events, campaigns, and opportunities from verified clubs.</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 p-5 text-white">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/70">Ask queries</p>
                  <h2 className="mt-4 text-xl font-bold">Students can raise questions</h2>
                  <p className="mt-2 text-sm text-white/72">Use the composer below for help, teams, resources, or guidance.</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-violet-800 via-fuchsia-800 to-slate-950 p-5 text-white">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/70">Community</p>
                  <h2 className="mt-4 text-xl font-bold">One feed for the network</h2>
                  <p className="mt-2 text-sm text-white/72">Club posts and student questions sit together for faster discovery.</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricPill icon={MessageCircle} label="Threads" value={stats.total} />
            <MetricPill icon={Building2} label="Colleges" value={stats.colleges || "New"} />
            <MetricPill icon={Users} label="Clubs" value={stats.clubs || "Join"} />
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <form onSubmit={handleSubmitQuery} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <MessageCircle className="h-4 w-4 text-indigo-600" />
                Raise a query
              </div>
              <input value={queryForm.title} onChange={(e) => setQueryForm({ ...queryForm, title: e.target.value })} placeholder="Title, e.g. Need help with a club event or placement roadmap" className={input} />
              <textarea value={queryForm.body} onChange={(e) => setQueryForm({ ...queryForm, body: e.target.value })} rows={3} placeholder="Write your question or message for the community" className={`${input} resize-none`} />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <select value={queryForm.category} onChange={(e) => setQueryForm({ ...queryForm, category: e.target.value })} className={`${input} sm:w-52`}>
                  {TOPIC_FILTERS.filter((topic) => topic !== "For You").map((topic) => <option key={topic}>{topic}</option>)}
                </select>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700">
                  <Send className="h-4 w-4" />
                  Post query
                </button>
              </div>
              {queryState && <p className="text-sm font-medium text-emerald-700">{queryState}</p>}
            </form>
          </div>

          <div className="mt-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {TOPIC_FILTERS.map((topic) => (
                <button key={topic} onClick={() => setActiveTopic(topic)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${activeTopic === topic ? "bg-slate-950 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>
                  {topic === "For You" ? <Flame className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                  {topic}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-5 text-sm font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5"><ArrowUp className="h-4 w-4" /> Most Votes</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> Newest</span>
            </div>
          </div>

          <section className="mt-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm sm:px-6">
            {loading ? (
              <div className="flex justify-center py-14"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" /></div>
            ) : filteredOfficialPosts.length === 0 && filteredQueries.length === 0 ? (
              <div className="py-14 text-center">
                <p className="font-bold text-slate-900">No discussions matched this view.</p>
                <p className="mt-2 text-sm text-slate-500">Try another topic or post a fresh query above.</p>
              </div>
            ) : (
              <>
                {filteredOfficialPosts.map((post) => <OfficialPostRow key={post._id} post={post} />)}
                {filteredQueries.map((query) => <QueryRow key={query.id} query={query} />)}
              </>
            )}
          </section>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {accountLoading ? (
              <p className="text-sm text-slate-500">Restoring discuss account...</p>
            ) : account ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-700">{account.clubName[0]}</div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950">{account.clubName}</p>
                    <p className="truncate text-xs text-slate-500">{account.collegeName}</p>
                  </div>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${account.isAuthorized ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {account.isAuthorized ? account.badgeLabel || "Verified" : "Pending verification"}
                </span>
                <div className="flex gap-2">
                  <button onClick={openComposer} className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700">Post update</button>
                  <button onClick={openClubAccountPanel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Account</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-bold text-slate-950">Official club posts</p>
                <p className="text-sm leading-6 text-slate-600">Club teams can log in, publish announcements, and appear as verified information cards.</p>
                <button onClick={openClubAccountPanel} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
                  <ShieldCheck className="h-4 w-4" />
                  Club account
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950"><BookOpen className="h-5 w-5" /> Explore</h2>
            <div className="mt-4 space-y-4">
              {exploreItems.map((item) => (
                <div key={item.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <p className="text-xs font-bold text-slate-400">#{item.label}</p>
                  <p className="mt-1 line-clamp-1 font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                </div>
              ))}
              {exploreItems.length === 0 && <p className="text-sm text-slate-500">Club announcements and active queries will show here.</p>}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            <Link href="/guide" className="font-bold text-indigo-600 hover:underline">Guide</Link>
            <span className="mx-2">|</span>
            <Link href="/contact" className="font-bold text-indigo-600 hover:underline">Support</Link>
          </div>
        </aside>
      </div>

      {panelMode && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30" onClick={closePanel}>
          <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h2 className="font-bold text-slate-900">{panelMode === "composer" ? (editingId ? "Edit post" : "Post update") : "Club account"}</h2>
              <button onClick={closePanel} className="rounded-full p-2 text-slate-400 hover:bg-slate-50" aria-label="Close panel"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 p-6">
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
                    <div>
                      <button type="button" onClick={() => {
                        const url = window.prompt("Enter link URL:");
                        const text = window.prompt("Enter link text:");
                        if (url && text) setPostForm((prev) => ({ ...prev, description: `${prev.description} [${text}](${url})` }));
                      }} className="mb-2 inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-600 transition hover:text-indigo-700">
                        <LinkIcon className="h-3.5 w-3.5" />
                        Add inline link
                      </button>
                      <textarea required rows={6} placeholder="Description... (You can use [Text](URL) for links)" value={postForm.description} onChange={(e) => setPostForm({ ...postForm, description: e.target.value })} className={`${input} resize-none`} />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Attach Images</label>
                      <div className="flex flex-wrap gap-2">
                        {postPhotos.map((f, i) => (
                          <div key={`${f.name}-${i}`} className="relative h-16 w-16 overflow-hidden rounded-xl ring-1 ring-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                            <button type="button" onClick={() => setPostPhotos((ps) => ps.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-rose-500 p-0.5 text-white" aria-label="Remove image"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        ))}
                        <button type="button" onClick={() => document.getElementById("discuss-photo-input")?.click()} className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition hover:border-indigo-400 hover:text-indigo-500" aria-label="Attach image"><ImageIcon className="h-5 w-5" /></button>
                        <input id="discuss-photo-input" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setRawCropFile(f); e.target.value = ""; }} />
                      </div>
                    </div>
                    <button type="submit" disabled={postState.loading} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                      <Send className="h-4 w-4" /> {postState.loading ? "Saving..." : editingId ? "Save changes" : "Publish"}
                    </button>
                  </form>
                </>
              ) : account ? (
                <div className="space-y-5">
                  <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-xl font-bold text-indigo-600">{account.clubName[0]}</div>
                      <div>
                        <p className="font-bold text-slate-900">{account.clubName}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" /> {account.collegeName}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1"><User className="h-3 w-3" /> {account.contactName}</p>
                      <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {account.email}</p>
                      {account.contactPhone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {account.contactPhone}</p>}
                    </div>
                  </div>

                  {myPosts.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">My Posts ({myPosts.length})</p>
                      <div className="custom-scrollbar max-h-48 space-y-2 overflow-y-auto">
                        {myPosts.map((p) => (
                          <div key={p._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                            <div className="min-w-0">
                              <p className="max-w-[200px] truncate text-xs font-semibold text-slate-800">{p.title}</p>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.status === "approved" ? "bg-emerald-50 text-emerald-600" : p.status === "rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>{p.status}</span>
                                {p.createdAt && <span className="text-[10px] text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</span>}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => { setEditingId(p._id); setPostForm({ title: p.title, description: p.description, type: p.type, actionLink: p.actionLink || "", eventDate: p.eventDate ? String(p.eventDate).slice(0, 10) : "" }); setPanelMode("composer"); }} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-white">Edit</button>
                              <button onClick={() => handleDeletePost(p._id)} className="rounded-lg p-1 text-rose-400 hover:bg-rose-50" aria-label="Delete post"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <>
                  {authState.error && <Message tone="error">{authState.error}</Message>}
                  {authState.success && <Message tone="success">{authState.success}</Message>}
                  <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
                    {(["login", "register"] as const).map((m) => (
                      <button key={m} onClick={() => setAuthMode(m)} className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${authMode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>{m}</button>
                    ))}
                  </div>
                  {authMode === "login" ? (
                    <form onSubmit={handleLogin} className="mt-2 space-y-4">
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input required placeholder="Club handle" list="club-handle-list" value={loginForm.handle} onChange={(e) => setLoginForm({ ...loginForm, handle: e.target.value })} className={`${input} pl-10`} />
                      </div>
                      <datalist id="club-handle-list">{clubHandles.map((h) => <option key={h} value={h} />)}</datalist>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input required type="password" placeholder="Password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className={`${input} pl-10`} />
                      </div>
                      <button type="submit" disabled={authState.loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60">
                        {authState.loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <LogIn className="h-4 w-4" />} Login
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="mt-2 space-y-4">
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input required placeholder="College / IIIT" list="college-list" value={regForm.collegeName} onChange={(e) => setRegForm({ ...regForm, collegeName: e.target.value })} className={`${input} pl-10`} />
                      </div>
                      <datalist id="college-list">{colleges.map((c) => <option key={c} value={c} />)}</datalist>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input required placeholder="Club / Society name" value={regForm.clubName} onChange={(e) => setRegForm({ ...regForm, clubName: e.target.value })} className={`${input} pl-10`} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input required placeholder="Contact name" value={regForm.contactName} onChange={(e) => setRegForm({ ...regForm, contactName: e.target.value })} className={`${input} pl-10`} />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input placeholder="Phone" value={regForm.contactPhone} onChange={(e) => setRegForm({ ...regForm, contactPhone: e.target.value })} className={`${input} pl-10`} />
                        </div>
                      </div>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input placeholder="Club website / Linktree" value={regForm.website} onChange={(e) => setRegForm({ ...regForm, website: e.target.value })} className={`${input} pl-10`} />
                      </div>
                      <div className="relative">
                        <AtSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input required placeholder="Club handle (e.g. ecellkota)" value={regForm.handle} onChange={(e) => setRegForm({ ...regForm, handle: e.target.value })} className={`${input} pl-10`} />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input required type="password" placeholder="Password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} className={`${input} pl-10`} />
                      </div>
                      <button type="submit" disabled={authState.loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60">
                        {authState.loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <UserPlus className="h-4 w-4" />} Create club account
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {account && !panelMode && (
        <button onClick={openComposer} className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-95 md:hidden" aria-label="New post">
          <Plus className="h-6 w-6" />
        </button>
      )}

      {rawCropFile && (
        <ImageCropModal
          file={rawCropFile}
          aspect={16 / 9}
          onClose={() => setRawCropFile(null)}
          onCrop={(cropped) => { setPostPhotos((ps) => [...ps, cropped]); setRawCropFile(null); }}
        />
      )}
    </section>
  );
}
