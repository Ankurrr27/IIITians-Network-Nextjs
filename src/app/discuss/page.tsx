"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { Suspense, useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUp,
  AtSign,
  BadgeCheck,
  BookOpen,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  Globe,
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
  Send,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";
import ImageCropModal from "@/components/ImageCropModal";
import api from "@/lib/apiClient";
import type { IDiscussAccount, IDiscussPost } from "@/types";
import PageHeader from "@/components/PageHeader";

const POST_TYPES = ["announcement", "event", "campaign", "collaboration", "opportunity"] as const;
const TOPIC_FILTERS = ["For You", "Career", "Contest", "Club Help", "Collaboration", "Events"] as const;

const INIT_POST = {
  title: "",
  description: "",
  type: "announcement" as string,
  actionLink: "",
  eventDate: "",
};
const INIT_LOGIN = { clubName: "", contactName: "", password: "" };
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

function Message({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <p className={`rounded-xl border px-4 py-3 text-sm ${tone === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      {children}
    </p>
  );
}

function FeaturedClubCard({ post, index }: { post: IDiscussPost; index: number }) {
  const imageUrl = post.banner?.url || post.photos?.[0]?.url || null;
  const fallbackTones = [
    "from-slate-950 via-indigo-950 to-sky-900",
    "from-emerald-900 via-teal-900 to-slate-950",
    "from-violet-900 via-fuchsia-900 to-slate-950",
  ];
  const fallbackPattern = fallbackTones[index % fallbackTones.length];

  return (
    <article className="group relative h-36 sm:h-44 lg:h-48 overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default w-full">
      {/* Background: real image or gradient fallback */}
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Multi-stop dark overlay: transparent top → heavy black bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${fallbackPattern}`}>
          {/* Decorative logo watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.06]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/IIITians-Network-Logo-Dark.png" alt="" className="w-48 object-contain" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-5">
        {/* Top: link only */}
        <div className="flex items-start justify-end">
          {post.actionLink && (
            <a
              href={post.actionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm transition hover:bg-white/30 hover:scale-102 active:scale-98 ring-1 ring-white/10"
            >
              Link <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        <div>
          <h3 className="line-clamp-2 text-sm sm:text-base font-bold leading-snug !text-white drop-shadow-md">
            {post.title}
          </h3>
        </div>
      </div>
    </article>
  );
}

function OfficialPostRow({
  post,
  isVoted,
  onVote,
}: {
  post: IDiscussPost;
  isVoted: boolean;
  onVote: (postId: string) => void;
}) {
  const [hasViewed, setHasViewed] = useState(false);
  const [viewsCount, setViewsCount] = useState(post.views || 0);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setViewsCount(post.views || 0);
  }, [post.views]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || hasViewed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasViewed) {
            setHasViewed(true);
            api.post(`/discuss/${post._id}/view`)
              .then((res) => {
                if (res.data?.views !== undefined) {
                  setViewsCount(res.data.views);
                } else {
                  setViewsCount((prev) => prev + 1);
                }
              })
              .catch(() => {
                setViewsCount((prev) => prev + 1);
              });
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [post._id, hasViewed]);

  const images = [
    ...(post.banner?.url ? [post.banner] : []),
    ...(post.photos || []),
  ].filter((image, index, list) => image?.url && list.findIndex((item) => item?.url === image.url) === index);
  const coverUrl = images[0]?.url;
  const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Recent";

  return (
    <article ref={elementRef} className={`border-b py-4 sm:py-5 ${post.isPinned ? "border-amber-100 bg-amber-50/40 -mx-4 px-4 sm:-mx-6 sm:px-6" : "border-slate-200"}`}>
      <div className="flex gap-3 sm:gap-4 items-start">
        <div className="hidden pt-1 sm:block">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${post.isPinned ? "bg-amber-500" : "bg-slate-950"}`}>
            {post.isPinned ? <Pin className="h-5 w-5" /> : <Megaphone className="h-5 w-5" />}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500">
            {post.isPinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                <Pin className="h-2.5 w-2.5 fill-amber-500" /> Pinned
              </span>
            )}
            <span className="font-semibold text-slate-800">{post.clubName}</span>
            {post.badgeLabel && <BadgeCheck className="h-3.5 w-3.5 fill-sky-500 text-white" />}
            <span>•</span>
            <span>{post.collegeName}</span>
            <span>•</span>
            <span>{date}</span>
          </div>
          <h3 className="mt-1 text-base sm:text-lg lg:text-xl font-bold leading-snug text-slate-950">{post.title}</h3>
          <p className="mt-2 line-clamp-3 text-xs sm:text-sm md:text-base leading-relaxed text-slate-600">
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
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
            <button
              onClick={() => onVote(post._id)}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition cursor-pointer hover:bg-slate-100 ${
                isVoted ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-500"
              }`}
            >
              <ArrowUp className={`h-3.5 w-3.5 ${isVoted ? "stroke-[2.5px]" : ""}`} />
              {post.upvotes || 0}
            </button>
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {viewsCount.toLocaleString("en-IN")}</span>
            <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> Official</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">{post.type}</span>
          </div>
          {post.actionLink && (
            <a href={post.actionLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800">
              Open link <LinkIcon className="h-3 w-3" />
            </a>
          )}
        </div>
        {coverUrl && (
          <a href={coverUrl} target="_blank" rel="noreferrer" className="h-16 w-16 sm:h-20 sm:w-28 md:h-28 md:w-44 shrink-0 overflow-hidden rounded-lg sm:rounded-xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt={post.title} className="h-full w-full object-cover transition hover:scale-105" />
          </a>
        )}
      </div>
    </article>
  );
}

function QueryRow({
  query,
  isVoted,
  onVote,
}: {
  query: QueryPost;
  isVoted: boolean;
  onVote: (queryId: string) => void;
}) {
  return (
    <article className="border-b border-slate-200 py-4 sm:py-5">
      <div className="flex gap-3 sm:gap-4 items-start">
        <div className="hidden pt-1 sm:block">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-600 ring-1 ring-slate-200">
            <HelpCircle className="h-5 w-5" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{query.author}</span>
            <span>•</span>
            <span>{query.college}</span>
            <span>•</span>
            <span>{query.createdAt}</span>
          </div>
          <h3 className="mt-1 text-base sm:text-lg lg:text-xl font-bold leading-snug text-slate-950">{query.title}</h3>
          <p className="mt-2 text-xs sm:text-sm md:text-base leading-relaxed text-slate-600">{query.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
            <button
              onClick={() => onVote(query.id)}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition cursor-pointer hover:bg-slate-100 ${
                isVoted ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-500"
              }`}
            >
              <ArrowUp className={`h-3.5 w-3.5 ${isVoted ? "stroke-[2.5px]" : ""}`} />
              {query.votes}
            </button>
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {query.views}</span>
            <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {query.replies}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">#{query.category}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function DiscussSkeleton() {
  return (
    <section className="min-h-screen bg-[#f5f7fb] pt-[4.5rem] pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-5 lg:px-6">
        {/* Header skeleton */}
        <div className="mb-5 space-y-3">
          <div className="h-8 w-2/3 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-4 w-1/2 rounded-lg bg-slate-100 animate-pulse" />
          <div className="mt-2 h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-0 pb-6 pt-1 sm:px-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:px-6">
        <main className="min-w-0 space-y-4">
          {/* Featured cards skeleton */}
          <div className="flex overflow-x-auto gap-3 pb-3 px-4 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:pb-0 scrollbar-none">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-[75vw] shrink-0 sm:w-auto h-36 sm:h-44 lg:h-48 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
          {/* Feed rows skeleton */}
          <div className="rounded-none sm:rounded-xl border-x-0 sm:border border-slate-200 bg-white px-4 sm:px-6 shadow-none sm:shadow-sm">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-b border-slate-100 py-4 sm:py-5 last:border-0">
                <div className="flex gap-3 sm:gap-4">
                  <div className="hidden h-10 w-10 shrink-0 rounded-full bg-slate-100 animate-pulse sm:block" />
                  <div className="flex-1 space-y-2.5">
                    <div className="flex gap-2">
                      <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
                      <div className="h-3 w-16 rounded bg-slate-100 animate-pulse" />
                    </div>
                    <div className="h-5 w-3/4 rounded-lg bg-slate-100 animate-pulse" />
                    <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
                    <div className="h-3 w-5/6 rounded bg-slate-100 animate-pulse" />
                    <div className="flex gap-3 pt-1">
                      <div className="h-6 w-14 rounded-full bg-slate-100 animate-pulse" />
                      <div className="h-6 w-14 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
        <aside className="space-y-5 px-4 sm:px-0">
          {/* Sidebar account skeleton */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-3/4 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
            <div className="mt-3 h-8 w-24 rounded-full bg-slate-100 animate-pulse" />
            <div className="mt-3 h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
          </div>
          {/* Sidebar explore skeleton */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="h-5 w-24 rounded bg-slate-100 animate-pulse" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5 border-b border-slate-100 pb-3 last:border-0">
                <div className="h-2.5 w-12 rounded bg-slate-100 animate-pulse" />
                <div className="h-3.5 w-4/5 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function DiscussPage() {
  return (
    <Suspense fallback={<DiscussSkeleton />}>
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
  const [queries, setQueries] = useState<QueryPost[]>([]);
  const [activeTopic, setActiveTopic] = useState<(typeof TOPIC_FILTERS)[number]>("For You");
  const [search, setSearch] = useState("");
  const [postState, setPostState] = useState({ loading: false, error: "", success: "" });
  const [authState, setAuthState] = useState({ loading: false, error: "", success: "" });
  const [queryState, setQueryState] = useState("");
  const [colleges, setColleges] = useState<string[]>([]);
  const [postPhotos, setPostPhotos] = useState<File[]>([]);
  const [rawCropFile, setRawCropFile] = useState<File | null>(null);
  const [clubNames, setClubNames] = useState<string[]>([]);
  const [showQueryForm, setShowQueryForm] = useState(false);
  const [votedPostIds, setVotedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("votedPostIds");
        if (saved) {
          setVotedPostIds(new Set(JSON.parse(saved)));
        }
      } catch (e) {
        console.error("Failed to load voted post IDs", e);
      }
    }
  }, []);

  const approvedPosts = useMemo(() => posts.filter((p) => p.status === "approved"), [posts]);
  const pinnedPosts = useMemo(() => approvedPosts.filter((p) => p.isPinned), [approvedPosts]);
  const featuredPosts = useMemo(() => (pinnedPosts.length > 0 ? pinnedPosts : approvedPosts).slice(0, 3), [pinnedPosts, approvedPosts]);

  const filteredOfficialPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return approvedPosts.filter((post) => {
      const topicMatch = activeTopic === "For You" || post.type === "event" && activeTopic === "Events" || post.type === "collaboration" && activeTopic === "Collaboration";
      const searchMatch = !q || [post.title, post.description, post.clubName, post.collegeName, post.type].join(" ").toLowerCase().includes(q);
      return topicMatch && searchMatch;
    });
  }, [activeTopic, approvedPosts, search]);

  const filteredPinnedPosts = useMemo(() => filteredOfficialPosts.filter((p) => p.isPinned), [filteredOfficialPosts]);
  const filteredRegularPosts = useMemo(() => filteredOfficialPosts.filter((p) => !p.isPinned), [filteredOfficialPosts]);

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
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number } }).response;
      if (response && (response.status === 401 || response.status === 403)) {
        localStorage.removeItem("discussToken");
        setAccount(null);
        setMyPosts([]);
      }
    } finally {
      setAccountLoading(false);
    }
  };

  const loadQueries = async () => {
    try {
      const res = await api.get("/discuss-queries");
      const raw = Array.isArray(res.data) ? res.data : [];
      setQueries(
        raw.map((q: Record<string, unknown>) => ({
          id: String(q._id ?? q.id ?? ""),
          title: String(q.title ?? ""),
          body: String(q.body ?? ""),
          author: String(q.clubName ?? q.author ?? "Anonymous"),
          college: String(q.collegeName ?? q.college ?? ""),
          category: String(q.category ?? "Club Help"),
          createdAt: q.createdAt
            ? new Date(String(q.createdAt)).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
            : "Recent",
          replies: Number(q.replies ?? 0),
          views: String(q.views ?? 0),
          votes: Number(q.upvotes ?? q.votes ?? 0),
        }))
      );
    } catch (err) {
      console.error("Failed to load queries:", err);
    }
  };

  useEffect(() => {
    loadPosts();
    loadQueries();
    loadAccount();
    api.get("/colleges").then((r) => setColleges((r.data || []).map((c: { name: string }) => c.name)));
    api.get("/discuss-accounts/handles").then((r) => setClubNames(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get("clubAccount") === "true") setPanelMode("auth");
  }, [searchParams]);

  const handleVote = async (postId: string) => {
    const isVoted = votedPostIds.has(postId);
    const newVoted = new Set(votedPostIds);
    const action = isVoted ? "down" : "up";

    if (isVoted) {
      newVoted.delete(postId);
    } else {
      newVoted.add(postId);
    }

    setVotedPostIds(newVoted);
    localStorage.setItem("votedPostIds", JSON.stringify(Array.from(newVoted)));

    // Optimistically update the UI count
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p._id === postId) {
          const currentUpvotes = p.upvotes || 0;
          return {
            ...p,
            upvotes: Math.max(0, currentUpvotes + (action === "up" ? 1 : -1)),
          };
        }
        return p;
      })
    );

    try {
      const res = await api.post(`/discuss/${postId}/vote`, { action });
      const serverUpvotes = res.data.upvotes;
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p._id === postId) {
            return { ...p, upvotes: serverUpvotes };
          }
          return p;
        })
      );
    } catch (err) {
      console.error("Failed to send vote to backend", err);
      // Revert state on error
      const revertedVoted = new Set(votedPostIds);
      setVotedPostIds(revertedVoted);
      localStorage.setItem("votedPostIds", JSON.stringify(Array.from(revertedVoted)));
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p._id === postId) {
            const currentUpvotes = p.upvotes || 0;
            return {
              ...p,
              upvotes: Math.max(0, currentUpvotes + (action === "up" ? -1 : 1)),
            };
          }
          return p;
        })
      );
    }
  };

  const handleQueryVote = async (queryId: string) => {
    const isVoted = votedPostIds.has(queryId);
    const newVoted = new Set(votedPostIds);
    const action = isVoted ? "down" : "up";

    if (isVoted) {
      newVoted.delete(queryId);
    } else {
      newVoted.add(queryId);
    }

    setVotedPostIds(newVoted);
    localStorage.setItem("votedPostIds", JSON.stringify(Array.from(newVoted)));

    // Optimistic update
    setQueries((prevQueries) =>
      prevQueries.map((q) => {
        if (q.id === queryId) {
          return { ...q, votes: q.votes + (isVoted ? -1 : 1) };
        }
        return q;
      })
    );

    try {
      const res = await api.post(`/discuss-queries/${queryId}/vote`, { action });
      const serverVotes = res.data?.upvotes ?? res.data?.votes;
      if (serverVotes !== undefined) {
        setQueries((prevQueries) =>
          prevQueries.map((q) => (q.id === queryId ? { ...q, votes: serverVotes } : q))
        );
      }
    } catch (err) {
      console.error("Failed to send query vote:", err);
      // Revert
      setVotedPostIds(new Set(votedPostIds));
      setQueries((prevQueries) =>
        prevQueries.map((q) => {
          if (q.id === queryId) {
            return { ...q, votes: q.votes + (isVoted ? 1 : -1) };
          }
          return q;
        })
      );
    }
  };

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

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("discussToken");
    if (!token) return;
    if (!queryForm.title.trim() || !queryForm.body.trim()) return;
    setQueryState("posting");
    try {
      await api.post(
        "/discuss-queries",
        { title: queryForm.title.trim(), body: queryForm.body.trim(), category: queryForm.category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQueryForm(INIT_QUERY);
      setShowQueryForm(false);
      setQueryState("success");
      await loadQueries();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to post query.";
      setQueryState(msg);
    }
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
    <section className="min-h-screen bg-[#f5f7fb] pt-[4.5rem] text-slate-950 pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-5 lg:px-6">
        <PageHeader
          title=""
          description=""
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search discussions..."
          className="mb-2 sm:mb-5"
          filters={
            <div className="w-full">
              {/* Dropdown for mobile */}
              <div className="block sm:hidden w-full relative">
                <select
                  value={activeTopic}
                  onChange={(e) => setActiveTopic(e.target.value as typeof activeTopic)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 cursor-pointer"
                >
                  {TOPIC_FILTERS.map((topic) => (
                    <option key={topic} value={topic}>
                      Category: {topic}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chips for desktop */}
              <div className="hidden sm:flex flex-wrap gap-2">
                {TOPIC_FILTERS.map((topic) => {
                  const isActive = activeTopic === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setActiveTopic(topic)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition duration-200 cursor-pointer ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/15"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          }
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-0 pb-6 pt-1 sm:px-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:px-6">
        <main className="min-w-0">
          {featuredPosts.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-4 sm:px-0">Featured Updates</h2>
              <div className="flex overflow-x-auto gap-3 pb-3 px-4 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:pb-0 scrollbar-none snap-x snap-mandatory">
                {featuredPosts.map((post, index) => (
                  <div key={post._id} className="w-[75vw] shrink-0 snap-center sm:w-auto">
                    <FeaturedClubCard post={post} index={index} />
                  </div>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-4 sm:px-0">Featured Updates</h2>
              <div className="flex overflow-x-auto gap-3 pb-3 px-4 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:pb-0 scrollbar-none">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-[75vw] shrink-0 sm:w-auto h-36 sm:h-44 lg:h-48 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            </div>
          ) : null}

          {account && (
            <div className="mt-6 rounded-none sm:rounded-xl border-x-0 sm:border border-slate-200 bg-white p-4 shadow-none sm:shadow-sm">
              {!showQueryForm ? (
                <button
                  type="button"
                  onClick={() => setShowQueryForm(true)}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100/80 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-indigo-600" />
                    Raise a query
                  </span>
                  <Plus className="h-4 w-4 text-slate-500" />
                </button>
              ) : (
                <form onSubmit={handleSubmitQuery} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <MessageCircle className="h-4 w-4 text-indigo-600" />
                      Raise a query
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQueryForm(false)}
                      className="rounded-full p-1 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                      aria-label="Close query form"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    value={queryForm.title}
                    onChange={(e) => setQueryForm({ ...queryForm, title: e.target.value })}
                    placeholder="Title, e.g. Need help with a club event or placement roadmap"
                    className={input}
                  />
                  <textarea
                    value={queryForm.body}
                    onChange={(e) => setQueryForm({ ...queryForm, body: e.target.value })}
                    rows={3}
                    placeholder="Write your question or message for the community"
                    className={`${input} resize-none`}
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <select
                      value={queryForm.category}
                      onChange={(e) => setQueryForm({ ...queryForm, category: e.target.value })}
                      className={`${input} sm:w-52`}
                    >
                      {TOPIC_FILTERS.filter((topic) => topic !== "For You").map((topic) => (
                        <option key={topic}>{topic}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={queryState === "posting"}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
                    >
                      {queryState === "posting" ? (
                        <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Posting...</>
                      ) : (
                        <><Send className="h-4 w-4" /> Post query</>
                      )}
                    </button>
                  </div>
                  {queryState && queryState !== "posting" && (
                    <p className={`text-sm font-medium ${queryState === "success" ? "text-emerald-700" : "text-rose-600"}`}>
                      {queryState === "success" ? "✓ Query posted successfully!" : queryState}
                    </p>
                  )}
                </form>
              )}
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center gap-5 text-sm font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5"><ArrowUp className="h-4 w-4" /> Most Votes</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> Newest</span>
            </div>
          </div>

          <section className="mt-3 rounded-none sm:rounded-xl border-x-0 sm:border border-slate-200 bg-white px-4 sm:px-6 shadow-none sm:shadow-sm">
            {loading ? (
              <div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-b border-slate-100 py-6 last:border-0">
                    <div className="flex gap-4">
                      <div className="hidden h-10 w-10 shrink-0 rounded-full bg-slate-100 animate-pulse sm:block" />
                      <div className="flex-1 space-y-2.5">
                        <div className="flex gap-2">
                          <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
                          <div className="h-3 w-16 rounded bg-slate-100 animate-pulse" />
                        </div>
                        <div className="h-5 w-3/4 rounded-lg bg-slate-100 animate-pulse" />
                        <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
                        <div className="h-3 w-5/6 rounded bg-slate-100 animate-pulse" />
                        <div className="flex gap-3 pt-1">
                          <div className="h-6 w-14 rounded-full bg-slate-100 animate-pulse" />
                          <div className="h-6 w-14 rounded-full bg-slate-100 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOfficialPosts.length === 0 && filteredQueries.length === 0 ? (
              <div className="py-14 text-center">
                <p className="font-bold text-slate-900">No discussions matched this view.</p>
                <p className="mt-2 text-sm text-slate-500">Try another topic or post a fresh query above.</p>
              </div>
            ) : (
              <>
                {/* Pinned posts section */}
                {filteredPinnedPosts.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 pt-4 pb-1">
                      <Pin className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">Pinned by admin</span>
                    </div>
                    {filteredPinnedPosts.map((post) => (
                      <OfficialPostRow
                        key={post._id}
                        post={post}
                        isVoted={votedPostIds.has(post._id)}
                        onVote={handleVote}
                      />
                    ))}
                    {(filteredRegularPosts.length > 0 || filteredQueries.length > 0) && (
                      <div className="flex items-center gap-2 pt-4 pb-1">
                        <Megaphone className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">All posts</span>
                      </div>
                    )}
                  </>
                )}
                {/* Regular posts */}
                {filteredRegularPosts.map((post) => (
                  <OfficialPostRow
                    key={post._id}
                    post={post}
                    isVoted={votedPostIds.has(post._id)}
                    onVote={handleVote}
                  />
                ))}
                {filteredQueries.map((query) => (
                  <QueryRow
                    key={query.id}
                    query={query}
                    isVoted={votedPostIds.has(query.id)}
                    onVote={handleQueryVote}
                  />
                ))}
              </>
            )}
          </section>
        </main>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start px-4 sm:px-0">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            {accountLoading ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-slate-100 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
                <div className="h-7 w-20 rounded-full bg-slate-100 animate-pulse" />
                <div className="h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
              </div>
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
                        <ShieldCheck className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input required placeholder="Club Name (e.g. E-Cell)" list="club-name-list" value={loginForm.clubName} onChange={(e) => setLoginForm({ ...loginForm, clubName: e.target.value })} className={`${input} pl-10`} />
                      </div>
                      <datalist id="club-name-list">{clubNames.map((n) => <option key={n} value={n} />)}</datalist>
                      
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input required placeholder="Point of contact name" value={loginForm.contactName} onChange={(e) => setLoginForm({ ...loginForm, contactName: e.target.value })} className={`${input} pl-10`} />
                      </div>

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
