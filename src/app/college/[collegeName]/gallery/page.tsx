"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/apiClient";
import type { ICollege } from "@/types";
import { Images, Search, Camera, Building2, History, Upload, Send, ExternalLink, X, SlidersHorizontal } from "lucide-react";

const CATS = [
  { id: "all", label: "All" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "clubs", label: "Clubs" },
  { id: "events", label: "Events" },
  { id: "others", label: "Others" },
];

interface Photo { _id?: string; url: string; caption?: string; category?: string; createdAt?: string; collegeName?: string; collegeId?: string; index?: number; }

export default function CollegeGalleryPage() {
  const params = useParams<{ collegeName: string }>();
  const collegeName = params.collegeName ? decodeURIComponent(params.collegeName) : "";
  const normalizedName = collegeName.toLowerCase();

  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Photo | null>(null);
  const [copied, setCopied] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [upForm, setUpForm] = useState({ collegeId: "", caption: "", category: "others" });
  const [upFiles, setUpFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [upMsg, setUpMsg] = useState({ type: "", text: "" });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    api.get("/colleges").then((r) => setColleges(r.data || [])).finally(() => setLoading(false));
    const token = localStorage.getItem("adminToken");
    if (token) {
      api.get("/admin/me")
        .then(() => setIsAdmin(true))
        .catch(() => setIsAdmin(false));
    }
  }, []);

  useEffect(() => {
    if (!collegeName || !colleges.length || upForm.collegeId) return;
    const m = colleges.find((c) => c.name.toLowerCase() === normalizedName);
    if (m?._id) setUpForm((p) => ({ ...p, collegeId: m._id }));
  }, [collegeName, colleges, normalizedName, upForm.collegeId]);

  const allPhotos = useMemo(() => {
    const flat = colleges.flatMap((c) => (c.gallery || []).map((img) => ({ ...img, collegeName: c.name, collegeId: c._id })));
    return flat.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : (a._id ? parseInt((a._id as string).slice(0, 8), 16) * 1000 : 0);
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : (b._id ? parseInt((b._id as string).slice(0, 8), 16) * 1000 : 0);
      return tb - ta;
    });
  }, [colleges]);

  const scoped = useMemo(() => collegeName ? allPhotos.filter((p) => p.collegeName?.toLowerCase() === normalizedName) : allPhotos, [allPhotos, collegeName, normalizedName]);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return scoped.filter((p) => (cat === "all" || p.category === cat) && (p.caption?.toLowerCase().includes(q) || (!collegeName && p.collegeName?.toLowerCase().includes(q))));
  }, [scoped, cat, query, collegeName]);

  const open = useCallback((p: Photo, i: number) => setSelected({ ...p, index: i }), []);
  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      const i = selected.index ?? 0;
      if (e.key === "ArrowRight") open(filtered[(i + 1) % filtered.length], (i + 1) % filtered.length);
      if (e.key === "ArrowLeft") open(filtered[(i - 1 + filtered.length) % filtered.length], (i - 1 + filtered.length) % filtered.length);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selected, filtered, open, close]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upForm.collegeId || !upFiles.length) { setUpMsg({ type: "error", text: "Select a college and at least one image." }); return; }
    setUploading(true); setUpMsg({ type: "", text: "" });
    try {
      const fd = new FormData();
      upFiles.forEach((f) => fd.append("images", f));
      upFiles.forEach(() => fd.append("captions", upForm.caption));
      upFiles.forEach(() => fd.append("categories", upForm.category));
      await api.patch(`/colleges/${upForm.collegeId}/gallery`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setColleges((await api.get("/colleges")).data || []);
      setUpFiles([]); setUpForm((p) => ({ ...p, caption: "", category: "others" }));
      setUpMsg({ type: "success", text: "Photos uploaded!" });
    } catch (err: unknown) {
      setUpMsg({ type: "error", text: (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Upload failed." });
    } finally { setUploading(false); }
  };

  const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200";

  return (
    <div className="min-h-screen bg-white pb-16 pt-18 sm:pb-20 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Header — compact on mobile, full on desktop */}
        <div className="mb-3 sm:mb-10 text-left">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {collegeName ? <>{collegeName} <span className="text-indigo-600">Gallery</span></> : <>IIIT <span className="text-indigo-600">Gallery</span></>}
          </h1>
          {/* Subtitle — desktop only */}
          <p className="hidden sm:block mt-2 text-sm text-slate-500">
            {collegeName ? `Visual memories from ${collegeName}.` : "Explore photos from across the IIIT network."}
          </p>
        </div>

        {/* ─── Unified Toolbar: Add + Filter + Search ─── */}
        <div className="mb-4 sm:mb-6 flex items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search photos..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-4 text-xs sm:text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => { setIsFilterOpen(!isFilterOpen); if (showUpload) setShowUpload(false); }}
            className={`relative flex h-9 w-9 sm:h-10 sm:w-auto sm:px-4 shrink-0 items-center justify-center gap-1.5 rounded-xl border transition ${
              isFilterOpen
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs font-semibold">Filters</span>
            {cat !== "all" && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-700 text-[9px] font-bold text-white">1</span>
            )}
          </button>

          {/* Add / Upload button */}
          {isAdmin && (
            <button
              onClick={() => { setShowUpload(!showUpload); if (isFilterOpen) setIsFilterOpen(false); }}
              className={`flex h-9 sm:h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 sm:px-4 text-xs font-semibold transition ${
                showUpload
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-indigo-100 bg-white text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Photos</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>

        {/* ─── Filter Dropdown Panel ─── */}
        {isFilterOpen && (
          <div className="mb-4 sm:mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCat(c.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${cat === c.id ? "bg-indigo-700 text-white" : "border border-indigo-100 bg-white text-slate-600 hover:border-indigo-300"}`}
                  >
                    {c.label} <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${cat === c.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{c.id === "all" ? scoped.length : scoped.filter((p) => p.category === c.id).length}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setCat("all")}
                  className="text-xs font-semibold text-indigo-600 hover:underline transition"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="rounded-full bg-indigo-700 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Upload Form (expandable) ─── */}
        {showUpload && isAdmin && (
          <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-indigo-50/50 p-3 shadow-sm sm:mb-6 sm:p-5">
            <form onSubmit={handleUpload} className="space-y-3">
              <h3 className="font-bold text-slate-900">Upload Photos</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={upForm.collegeId} onChange={(e) => setUpForm((p) => ({ ...p, collegeId: e.target.value }))} className={input}>
                  <option value="">Select college</option>
                  {colleges.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select value={upForm.category} onChange={(e) => setUpForm((p) => ({ ...p, category: e.target.value }))} className={input}>
                  <option value="infrastructure">Infrastructure</option><option value="clubs">Clubs</option><option value="events">Events</option><option value="others">Others</option>
                </select>
                <input value={upForm.caption} onChange={(e) => setUpForm((p) => ({ ...p, caption: e.target.value }))} placeholder="Caption" className={`sm:col-span-2 ${input}`} />
                <label className={`sm:col-span-2 flex min-h-[56px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-600 hover:border-indigo-300`}>
                  <span>{upFiles.length ? `${upFiles.length} file${upFiles.length > 1 ? "s" : ""} selected` : "Choose images"}</span>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Browse</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { setUpFiles(Array.from(e.target.files || [])); e.target.value = ""; }} />
                </label>
              </div>
              {upMsg.text && <div className={`rounded-xl px-4 py-2.5 text-sm font-medium ${upMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{upMsg.text}</div>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowUpload(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={uploading} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  <Send className="h-4 w-4" /> {uploading ? "Uploading…" : "Submit"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Photo Grid */}
        {loading ? (
          <div className="columns-2 gap-1 sm:columns-2 sm:gap-2 lg:columns-3 xl:columns-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mb-1 inline-block w-full break-inside-avoid sm:mb-2"><div className="animate-pulse rounded-lg bg-slate-200" style={{ height: `${150 + (i % 3) * 54}px` }} /></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="rounded-full bg-slate-100 p-8 text-slate-300"><Camera size={48} /></div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900">No photos found</h3>
            <p className="mt-2 text-sm text-slate-400">Try changing the filter or search query.</p>
          </div>
        ) : (
          <div className="columns-2 gap-1 sm:columns-2 sm:gap-2 lg:columns-3 xl:columns-4">
            {filtered.map((photo, idx) => (
              <div key={`${photo.url}-${idx}`} onClick={() => open(photo, idx)}
                className="group mb-1 inline-block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-md sm:mb-2 sm:rounded-xl transition-all hover:opacity-90">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url.replace("/upload/", "/upload/f_auto,q_auto,w_900/")} alt={photo.caption || "Gallery"} className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/88 p-4 backdrop-blur-xl" onClick={close}>
          <div className="relative flex max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={close} className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-700 shadow transition hover:bg-white"><X size={20} /></button>
            {filtered.length > 1 && (
              <>
                <button onClick={() => { const n = ((selected.index ?? 0) - 1 + filtered.length) % filtered.length; open(filtered[n], n); }} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow transition hover:bg-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button onClick={() => { const n = ((selected.index ?? 0) + 1) % filtered.length; open(filtered[n], n); }} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow transition hover:bg-white md:right-[33%]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </>
            )}
            <div className="relative h-[70vh] w-full bg-slate-50 md:h-auto md:w-2/3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.url} alt={selected.caption} className="h-full w-full object-contain" loading="eager" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-800 shadow">{(selected.index ?? 0) + 1} / {filtered.length}</div>
            </div>
            <div className="hidden w-1/3 flex-col justify-between p-6 md:flex">
              <div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">{selected.category || "other"}</span>
                <h2 className="mt-4 text-lg font-bold text-slate-900">{selected.caption || "Untitled Memory"}</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-500">
                  <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-indigo-400" />{selected.collegeName}</p>
                  {selected.createdAt && <p className="flex items-center gap-2"><History className="h-4 w-4 text-indigo-400" />{new Date(selected.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>}
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-bold transition ${copied ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"}`}>
                  {copied ? "✓ Copied!" : "Share Photo URL"}
                </button>
                <button onClick={() => window.open(selected.url, "_blank")} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
                  Full Resolution <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
