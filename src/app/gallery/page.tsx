"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Images,
  Camera,
  Search,
  ExternalLink,
  X,
  History,
  Building2,
  Users,
  Sparkles,
  Upload,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/apiClient";

const categories = [
  { id: "all", label: "All" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "clubs", label: "Clubs" },
  { id: "events", label: "Events" },
  { id: "others", label: "Others" },
];

interface GalleryPhoto {
  _id?: string;
  url: string;
  caption?: string;
  category?: string;
  createdAt?: string;
  public_id?: string;
  collegeName?: string;
  collegeId?: string;
  index?: number;
}

interface CollegeData {
  _id: string;
  name: string;
  gallery?: GalleryPhoto[];
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryPageClient />
    </Suspense>
  );
}

function GalleryPageClient() {
  const searchParamsObj = useSearchParams();
  const [colleges, setColleges] = useState<CollegeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<GalleryPhoto | null>(null);
  const [copied, setCopied] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadCollegeId, setUploadCollegeId] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadCategory, setUploadCategory] = useState("others");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: "", text: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  const openPhoto = useCallback((photo: GalleryPhoto, index: number) => {
    setSelectedImage({ ...photo, index });
    const url = new URL(window.location.href);
    url.searchParams.set("photo", String(index));
    window.history.replaceState({}, "", url.toString());
  }, []);

  const closePhoto = useCallback(() => {
    setSelectedImage(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("photo");
    window.history.replaceState({}, "", url.toString());
  }, []);

  const copyShareUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await api.get("/colleges");
        setColleges(res.data || []);
      } catch {
        setColleges([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const allPhotos = useMemo(() => {
    const photos = colleges.flatMap((college) =>
      (college.gallery || []).map((img) => ({
        ...img,
        collegeName: college.name,
        collegeId: college._id,
      }))
    );
    const getTime = (photo: GalleryPhoto) => {
      if (photo.createdAt) return new Date(photo.createdAt).getTime();
      if (photo._id && typeof photo._id === "string" && photo._id.length >= 8) {
        return parseInt(photo._id.substring(0, 8), 16) * 1000;
      }
      return 0;
    };
    return photos.sort((a, b) => getTime(b) - getTime(a));
  }, [colleges]);

  const categoryCounts = useMemo(() => {
    return categories.reduce<Record<string, number>>((acc, cat) => {
      acc[cat.id] = cat.id === "all" ? allPhotos.length : allPhotos.filter((p) => p.category === cat.id).length;
      return acc;
    }, {});
  }, [allPhotos]);

  const filteredPhotos = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return allPhotos.filter((photo) => {
      const matchesCategory = selectedCategory === "all" || photo.category === selectedCategory;
      const matchesSearch =
        !query ||
        photo.caption?.toLowerCase().includes(query) ||
        photo.collegeName?.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [allPhotos, selectedCategory, searchQuery]);

  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPhotos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPhotos, currentPage]);

  const totalPages = Math.ceil(filteredPhotos.length / ITEMS_PER_PAGE);

  // Auto-open photo from URL
  useEffect(() => {
    const photoIndex = parseInt(searchParamsObj.get("photo") || "");
    if (!isNaN(photoIndex) && filteredPhotos[photoIndex]) {
      setSelectedImage({ ...filteredPhotos[photoIndex], index: photoIndex });
    }
  }, [filteredPhotos]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePhoto();
      if (e.key === "ArrowRight") {
        const next = ((selectedImage.index ?? 0) + 1) % filteredPhotos.length;
        openPhoto(filteredPhotos[next], next);
      }
      if (e.key === "ArrowLeft") {
        const prev = ((selectedImage.index ?? 0) - 1 + filteredPhotos.length) % filteredPhotos.length;
        openPhoto(filteredPhotos[prev], prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedImage, filteredPhotos, openPhoto, closePhoto]);

  const handleUploadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!uploadCollegeId || uploadFiles.length === 0) {
      setUploadMessage({ type: "error", text: "Please choose a college and at least one image." });
      return;
    }
    setUploading(true);
    setUploadMessage({ type: "", text: "" });
    try {
      const formData = new FormData();
      uploadFiles.forEach((file) => formData.append("images", file));
      uploadFiles.forEach(() => formData.append("captions", uploadCaption));
      uploadFiles.forEach(() => formData.append("categories", uploadCategory));
      await api.patch(`/colleges/${uploadCollegeId}/gallery`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const res = await api.get("/colleges");
      setColleges(res.data || []);
      setUploadCaption("");
      setUploadCategory("others");
      setUploadFiles([]);
      setUploadMessage({ type: "success", text: "Thanks. Your images were added to the gallery." });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setUploadMessage({ type: "error", text: axiosErr.response?.data?.message || "Failed to upload images." });
    } finally {
      setUploading(false);
    }
  };

  const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200";

  if (loading) return <GallerySkeleton />;

  return (
    <div className="min-h-screen bg-white pb-16 pt-18 sm:pb-20 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-5 text-center sm:mb-10">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-700 shadow-sm sm:mb-4 sm:px-3 sm:py-1.5 sm:text-[11px] sm:tracking-[0.22em]">
            <Images className="h-4 w-4" /> Gallery
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            IIIT <span className="text-indigo-600">Gallery</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:mt-2 sm:text-sm">
            Explore photos from across the IIIT network.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((c) => (
              <button key={c.id} onClick={() => setSelectedCategory(c.id)}
                className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${selectedCategory === c.id ? "bg-indigo-700 text-white" : "border border-indigo-100 bg-white text-slate-600 hover:border-indigo-300"}`}>
                {c.label} <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${selectedCategory === c.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{categoryCounts[c.id] || 0}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search…" className="w-full rounded-full border border-slate-200 bg-white py-2 pl-8 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>
        </div>

        {/* Upload Section */}
        <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-indigo-50/50 p-3 shadow-sm sm:mb-8 sm:p-5">
          {!showUploadForm ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 sm:h-10 sm:w-10"><Upload className="h-4 w-4" /></div>
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">Contribute photos</p><p className="hidden text-xs text-slate-500 sm:block">Share your campus memories.</p></div>
              </div>
              <button onClick={() => setShowUploadForm(true)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm">
                <Upload className="h-4 w-4" /> Add
              </button>
            </div>
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <h3 className="font-bold text-slate-900">Upload Photos</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={uploadCollegeId} onChange={(e) => setUploadCollegeId(e.target.value)} className={input}>
                  <option value="">Select college</option>
                  {colleges.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className={input}>
                  <option value="infrastructure">Infrastructure</option><option value="clubs">Clubs</option><option value="events">Events</option><option value="others">Others</option>
                </select>
                <input value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} placeholder="Add a caption for these photos" className={`sm:col-span-2 ${input}`} />
                <label className={`sm:col-span-2 flex min-h-[56px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-600 hover:border-indigo-300`}>
                  <span>{uploadFiles.length ? `${uploadFiles.length} image${uploadFiles.length > 1 ? "s" : ""} selected` : "Choose one or more images"}</span>
                  <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Browse</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { setUploadFiles(Array.from(e.target.files || [])); e.target.value = ""; }} />
                </label>
              </div>
              {uploadMessage.text && <div className={`rounded-xl px-4 py-2.5 text-sm font-medium ${uploadMessage.type === "success" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"}`}>{uploadMessage.text}</div>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowUploadForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={uploading} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  <Send className="h-4 w-4" /> {uploading ? "Uploading…" : "Submit Photos"}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Photo Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="rounded-full bg-slate-100 p-8 text-slate-300"><Camera size={48} /></div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900">No photos found</h3>
            <p className="mt-2 text-sm text-slate-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-2 sm:gap-5 lg:columns-3 xl:columns-4">
            {paginatedPhotos.map((photo, idx) => (
              <div
                key={`${photo.url}-${idx}`}
                onClick={() => openPhoto(photo, filteredPhotos.indexOf(photo))}
                className="group mb-3 inline-block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-[1.1rem] border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:mb-5 sm:rounded-2xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url.includes("/upload/") ? photo.url.replace("/upload/", "/upload/f_auto,q_auto,w_900/") : photo.url}
                  alt={photo.caption || "Gallery photo"}
                  className="h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              // Show first, last, current, and adjacent pages
              if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition ${
                      currentPage === p
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              }
              // Show ellipsis
              if (p === 2 && currentPage > 3) {
                return <span key={p} className="px-1 text-slate-400">…</span>;
              }
              if (p === totalPages - 1 && currentPage < totalPages - 2) {
                return <span key={p} className="px-1 text-slate-400">…</span>;
              }
              return null;
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/88 p-4 backdrop-blur-xl" onClick={closePhoto}>
          <div className="relative flex max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={closePhoto} className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-700 shadow transition hover:bg-white"><X size={20} /></button>
            {filteredPhotos.length > 1 && (
              <>
                <button onClick={() => { const n = ((selectedImage.index ?? 0) - 1 + filteredPhotos.length) % filteredPhotos.length; openPhoto(filteredPhotos[n], n); }} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow transition hover:bg-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button onClick={() => { const n = ((selectedImage.index ?? 0) + 1) % filteredPhotos.length; openPhoto(filteredPhotos[n], n); }} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow transition hover:bg-white md:right-[33%]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </>
            )}
            <div className="relative h-[70vh] w-full bg-slate-50 md:h-auto md:w-2/3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedImage.url} alt={selectedImage.caption || ""} className="h-full w-full object-contain" loading="eager" decoding="async" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-800 shadow">{(selectedImage.index ?? 0) + 1} / {filteredPhotos.length}</div>
            </div>
            <div className="hidden w-1/3 flex-col justify-between p-6 md:flex">
              <div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">{selectedImage.category || "other"}</span>
                <h2 className="mt-4 text-lg font-bold text-slate-900">{selectedImage.caption || "Untitled Memory"}</h2>
                <div className="mt-4 space-y-2 text-sm text-slate-500">
                  <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-indigo-400" />{selectedImage.collegeName}</p>
                  {selectedImage.createdAt && <p className="flex items-center gap-2"><History className="h-4 w-4 text-indigo-400" />{new Date(selectedImage.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>}
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <button onClick={copyShareUrl}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-bold transition ${copied ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"}`}>
                  {copied ? "✓ Copied!" : "Share Photo URL"}
                </button>
                <button onClick={() => window.open(selectedImage.url, "_blank")} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
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

function GallerySkeleton() {
  return (
    <div className="min-h-screen bg-white pb-20 pt-24 sm:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="h-12 w-64 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-4 w-96 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="mt-12 columns-2 gap-3 sm:columns-2 sm:gap-5 lg:columns-3 xl:columns-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="mb-3 inline-block w-full break-inside-avoid sm:mb-5"><div className="animate-pulse rounded-2xl bg-slate-200" style={{ height: `${150 + (i % 3) * 54}px` }} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}
