"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Images,
  Camera,
  MapPin,
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
import { useParams, useSearchParams } from "next/navigation";
import api from "@/lib/apiClient";
import PageHeader, { pageHeaderButtonClass, pageHeaderControlClass } from "@/components/PageHeader";

const categories = [
  { id: "all", label: "All Photos", icon: <Images size={16} /> },
  { id: "infrastructure", label: "Infrastructure", icon: <Building2 size={16} /> },
  { id: "clubs", label: "Clubs", icon: <Users size={16} /> },
  { id: "events", label: "Events", icon: <Sparkles size={16} /> },
  { id: "others", label: "Others", icon: <History size={16} /> },
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
}

interface CollegeData {
  _id: string;
  name: string;
  gallery?: GalleryPhoto[];
}

function optimizeCloudinaryImage(url: string, transformations: string) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${transformations}/`);
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <GalleryPageClient />
    </Suspense>
  );
}

function GalleryPageClient() {
  const params = useParams();
  const collegeName = params?.collegeName as string | undefined;
  const [searchParamsObj] = [useSearchParams()];
  const [colleges, setColleges] = useState<CollegeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<(GalleryPhoto & { index: number }) | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadCollegeId, setUploadCollegeId] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadCategory, setUploadCategory] = useState("others");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ type: "", text: "" });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const normalizedCollegeName = useMemo(
    () => (collegeName ? decodeURIComponent(collegeName).toLowerCase() : ""),
    [collegeName]
  );

  const openPhoto = (photo: GalleryPhoto, index: number) => {
    setSelectedImage({ ...photo, index });
    const url = new URL(window.location.href);
    url.searchParams.set("photo", String(index));
    window.history.replaceState({}, "", url.toString());
  };

  const closePhoto = () => {
    setSelectedImage(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("photo");
    window.history.replaceState({}, "", url.toString());
  };

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
    if (!collegeName || colleges.length === 0 || uploadCollegeId) return;
    const matchedCollege = colleges.find(
      (college) => college.name?.toLowerCase() === normalizedCollegeName
    );
    if (matchedCollege?._id) setUploadCollegeId(matchedCollege._id);
  }, [collegeName, colleges, normalizedCollegeName, uploadCollegeId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, collegeName]);

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

  const scopedPhotos = useMemo(() => {
    if (!normalizedCollegeName) return allPhotos;
    return allPhotos.filter((photo) => photo.collegeName?.toLowerCase() === normalizedCollegeName);
  }, [allPhotos, normalizedCollegeName]);

  const categoryCounts = useMemo(() => {
    return categories.reduce<Record<string, number>>((acc, cat) => {
      acc[cat.id] = cat.id === "all" ? scopedPhotos.length : scopedPhotos.filter((p) => p.category === cat.id).length;
      return acc;
    }, {});
  }, [scopedPhotos]);

  const filteredPhotos = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return scopedPhotos.filter((photo) => {
      const matchesCategory = selectedCategory === "all" || photo.category === selectedCategory;
      const matchesSearch =
        photo.caption?.toLowerCase().includes(query) ||
        (!normalizedCollegeName && photo.collegeName?.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [scopedPhotos, selectedCategory, searchQuery, normalizedCollegeName]);

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
        const next = (selectedImage.index + 1) % filteredPhotos.length;
        openPhoto(filteredPhotos[next], next);
      }
      if (e.key === "ArrowLeft") {
        const prev = (selectedImage.index - 1 + filteredPhotos.length) % filteredPhotos.length;
        openPhoto(filteredPhotos[prev], prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedImage, filteredPhotos]); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (loading) return <GallerySkeleton />;

  return (
    <section className="ui-page-bg relative min-h-screen pb-10 pt-14 sm:pb-12 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />
      <div className="ui-page-shell relative z-10">
        <PageHeader
          title=""
          description=""
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search campus memories..."
          filters={
            <>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`${pageHeaderControlClass} w-full sm:w-48 text-xs sm:text-sm`}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label} ({categoryCounts[cat.id] || 0})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowUploadForm((v) => !v)}
                className="ui-button ui-button-primary inline-flex h-11 shrink-0 items-center justify-center gap-1.5 px-3.5 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Upload className="h-4 w-4" /> Add Image
              </button>
            </>
          }
        />

        {/* Upload Section */}
        {showUploadForm && (
          <section className="mb-6 sm:mb-8 overflow-hidden border-y sm:border border-slate-200 bg-white p-4 shadow-sm rounded-none sm:rounded-2xl">
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={uploadCollegeId}
                  onChange={(e) => setUploadCollegeId(e.target.value)}
                  className="w-full rounded-none sm:rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                >
                  <option value="">Select college</option>
                  {colleges.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full rounded-none sm:rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                >
                  <option value="infrastructure">Infrastructure</option>
                  <option value="clubs">Clubs</option>
                  <option value="events">Events</option>
                  <option value="others">Others</option>
                </select>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="Add a caption for these photos"
                  className="w-full rounded-none sm:rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 md:col-span-2"
                />
                <label className="flex min-h-[58px] cursor-pointer items-center justify-between gap-3 rounded-none sm:rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-white md:col-span-2">
                  <span className="pr-3">
                    {uploadFiles.length
                      ? `${uploadFiles.length} image${uploadFiles.length > 1 ? "s" : ""} selected`
                      : "Choose one or more images"}
                  </span>
                  <span className="shrink-0 rounded-none sm:rounded-xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    Browse
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      setUploadFiles(Array.from(e.target.files || []));
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="inline-flex w-full items-center justify-center rounded-none sm:rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-none sm:rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
                >
                  <Send className="h-4 w-4" /> {uploading ? "Uploading..." : "Submit Photos"}
                </button>
              </div>
            </form>
            {uploadMessage.text && (
              <div
                className={`mt-4 rounded-none sm:rounded-xl px-4 py-2.5 text-sm font-medium ${
                  uploadMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                }`}
              >
                {uploadMessage.text}
              </div>
            )}
          </section>
        )}

        {/* Photo Grid */}
        <div className="columns-2 gap-3 sm:columns-2 sm:gap-4 md:columns-3 lg:columns-3 xl:columns-4">
          {paginatedPhotos.map((photo) => (
            <div
              key={photo.url}
              onClick={() => openPhoto(photo, filteredPhotos.indexOf(photo))}
              className="group relative mb-3 sm:mb-4 inline-block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-xl bg-transparent transition-all duration-300"
            >
              <div className="relative overflow-hidden bg-slate-100/50 rounded-xl">
                <img
                  src={optimizeCloudinaryImage(photo.url, "f_auto,q_auto,w_900")}
                  alt={photo.caption || "Gallery photo"}
                  className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 flex items-end p-2 sm:p-3 opacity-0 group-hover:opacity-100">
                  <span className="text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                    {photo.category || "uncategorized"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-none sm:rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-none sm:rounded-xl text-sm font-semibold transition ${
                    currentPage === p
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-10 w-10 items-center justify-center rounded-none sm:rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {filteredPhotos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="rounded-full bg-slate-100 p-8 text-slate-300"><Camera size={48} /></div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900">No photos found</h3>
            <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-100/85"
            onClick={closePhoto}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full overflow-hidden rounded-none sm:rounded-2xl shadow-2xl border border-slate-200 bg-white"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={closePhoto} className="absolute right-6 top-6 z-10 rounded-none sm:rounded-xl p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                <X size={24} />
              </button>
              {filteredPhotos.length > 1 && (
                <>
                  <button onClick={() => { const p = (selectedImage.index - 1 + filteredPhotos.length) % filteredPhotos.length; openPhoto(filteredPhotos[p], p); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-none sm:rounded-xl p-3 bg-white/90 text-slate-700 shadow-md hover:bg-white transition md:left-6">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button onClick={() => { const n = (selectedImage.index + 1) % filteredPhotos.length; openPhoto(filteredPhotos[n], n); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-none sm:rounded-xl p-3 bg-white/90 text-slate-700 shadow-md hover:bg-white transition md:right-[34%]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </>
              )}
              <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                <div className="w-full md:w-2/3 h-[68vh] md:h-auto relative bg-slate-100">
                  <motion.img key={selectedImage.url} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
                    src={selectedImage.url} alt={selectedImage.caption || ""} className="h-full w-full object-contain" loading="eager" decoding="async" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-bold bg-white/90 text-slate-800 shadow-sm backdrop-blur-md">
                    {selectedImage.index + 1} / {filteredPhotos.length}
                  </div>
                </div>
                <div className="w-full md:w-1/3 flex flex-col justify-between overflow-y-auto bg-white text-slate-900">
                  <div className="px-4 py-3 md:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-none sm:rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ring-1 bg-indigo-50 text-indigo-700 ring-indigo-100">
                        {selectedImage.category || "uncategorized"}
                      </span>
                      <span className="text-[11px] text-slate-500 md:hidden">{selectedImage.collegeName}</span>
                    </div>
                    <h2 className="mt-2 text-base font-semibold leading-snug md:mt-6 md:text-2xl md:font-bold">{selectedImage.caption || "Untitled Memory"}</h2>
                    <div className="mt-6 hidden space-y-4 md:block">
                      <div className="flex items-center gap-4 font-medium">
                        <Building2 size={20} className="text-indigo-500 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">Institute</p>
                          <p className="text-sm font-bold text-slate-900">{selectedImage.collegeName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 font-medium">
                        <History size={20} className="text-indigo-500 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">Captured On</p>
                          <p className="text-sm font-bold text-slate-900">
                            {selectedImage.createdAt
                              ? new Date(selectedImage.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                              : "Unknown date"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 px-4 py-3 space-y-2 md:border-0 md:px-8 md:pb-8 md:pt-0 md:mt-10 md:space-y-3">
                    <button onClick={copyShareUrl}
                      className={`flex w-full items-center justify-center gap-2 rounded-none sm:rounded-xl border py-2.5 md:py-3.5 text-sm font-semibold md:font-extrabold transition ${
                        copied ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-600" : "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
                      }`}>
                      {copied ? "✓ Link Copied!" : "Share Photo URL"}
                    </button>
                    <button onClick={() => window.open(selectedImage.url, "_blank")}
                      className="group flex w-full items-center justify-center gap-2 rounded-none sm:rounded-xl py-2.5 md:py-3.5 text-sm font-semibold md:font-extrabold transition bg-slate-900 text-white hover:bg-slate-800">
                      Full Resolution <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
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
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
