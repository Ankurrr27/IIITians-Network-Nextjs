"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Images,
  Trash2,
  Sparkles,
  AlertCircle,
  LayoutGrid,
  Filter,
  ImagePlus,
  ArrowLeft,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { ICollege, GalleryImage } from "@/types";

const categoryOptions = [
  { value: "", label: "Uncategorized" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "clubs", label: "Clubs" },
  { value: "events", label: "Events" },
  { value: "others", label: "Others" },
];

interface FlatGalleryImage extends GalleryImage {
  collegeName: string;
  collegeId: string;
}

export default function AdminGalleryPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [selectedId, setSelectedId] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Upload States
  const [uploadTargetId, setUploadTargetId] = useState("");
  const [uploadPhotoFile, setUploadPhotoFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadCategory, setUploadCategory] = useState("others");
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [savingImageUrl, setSavingImageUrl] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const loadColleges = async () => {
    try {
      setLoading(true);
      const res = await api.get<ICollege[]>("/colleges");
      setColleges(res.data || []);
    } catch (err) {
      setError("Failed to load colleges.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
  }, []);

  const galleryData = useMemo(() => {
    let data: FlatGalleryImage[] = [];
    if (selectedId === "all") {
      data = colleges.flatMap((c) =>
        (c.gallery || []).map((img) => ({
          ...img,
          category: img.category || "others",
          collegeName: c.name,
          collegeId: c._id,
        }))
      );
    } else {
      const college = colleges.find((c) => c._id === selectedId);
      data = (college?.gallery || []).map((img) => ({
        ...img,
        category: img.category || "others",
        collegeName: college?.name || "",
        collegeId: college?._id || "",
      }));
    }
    return data.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [colleges, selectedId]);

  const totalPages = Math.ceil(galleryData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    return galleryData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [galleryData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedId]);

  const handleUpload = async () => {
    if (!uploadTargetId || !uploadPhotoFile) {
      setError("Please select a college and a photo to upload.");
      return;
    }

    setUploadInProgress(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("images", uploadPhotoFile);
    formData.append("caption", uploadCaption);
    formData.append("category", uploadCategory);

    try {
      await api.patch(`/colleges/${uploadTargetId}/gallery`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Asset published to gallery successfully.");
      setUploadPhotoFile(null);
      setUploadCaption("");
      loadColleges();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to upload gallery asset."
      );
    } finally {
      setUploadInProgress(false);
    }
  };

  const handleDelete = async (collegeId: string, imageUrl: string) => {
    if (!window.confirm("Are you sure you want to delete this photo permanently?"))
      return;

    try {
      await api.delete(`/colleges/${collegeId}/gallery`, { data: { imageUrl } });
      setSuccess("Image removed successfully.");

      setColleges((prev) =>
        prev.map((c) =>
          c._id === collegeId
            ? {
                ...c,
                gallery: (c.gallery || []).filter((img) => img.url !== imageUrl),
              }
            : c
        )
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to remove image.");
    }
  };

  const handleGalleryFieldChange = (
    collegeId: string,
    imageUrl: string,
    field: keyof FlatGalleryImage,
    value: string
  ) => {
    setColleges((prev) =>
      prev.map((college) =>
        college._id !== collegeId
          ? college
          : {
              ...college,
              gallery: (college.gallery || []).map((img) =>
                img.url !== imageUrl ? img : { ...img, [field]: value }
              ),
            }
      )
    );
  };

  const handleSaveImageMeta = async (collegeId: string, image: FlatGalleryImage) => {
    setSavingImageUrl(image.url);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/colleges/${collegeId}/gallery/meta`, {
        imageUrl: image.url,
        caption: image.caption || "",
        category: image.category || "",
      });
      setSuccess("Gallery image details updated.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update gallery image."
      );
    } finally {
      setSavingImageUrl("");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-[1.25rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.10),_transparent_30%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_100%)] p-4 shadow-[0_24px_70px_-40px_rgba(79,70,229,0.35)] sm:p-5">
          <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_center,_rgba(129,140,248,0.12),_transparent_60%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-indigo-100 bg-white text-indigo-600 shadow-sm transition-all hover:-translate-x-0.5 hover:text-indigo-700 hover:shadow-md active:scale-95"
                >
                  <ArrowLeft
                    size={18}
                    className="transition-transform group-hover:-translate-x-0.5"
                  />
                </button>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-700 ring-1 ring-indigo-100 shadow-sm">
                  Central Gallery Hub
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Manage <span className="text-indigo-600">Gallery</span>
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-6 text-slate-600">
                  Review community uploads, organize categories, and publish official visuals in the same design language as the public website.
                </p>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-xl border border-white/80 bg-white/85 p-3 shadow-sm backdrop-blur">
              <div className="mb-2 flex items-center justify-between px-1">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Total Network Items
                </label>
                <span className="text-[11px] font-semibold text-indigo-600">
                  {colleges.flatMap((c) => c.gallery || []).length} items
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Images size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Gallery Database</p>
                  <p className="text-xs font-semibold text-slate-500">
                    {colleges.length} Institutes Synced
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compact Messages */}
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
                <Sparkles size={16} />
                {success}
              </div>
            )}
          </div>
        )}

        {/* Compact Gallery Contributor */}
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4 rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <ImagePlus size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
                  Official Upload
                </p>
                <h2 className="text-xl font-semibold text-slate-900">Push To Gallery</h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Institute
                </label>
                <select
                  value={uploadTargetId}
                  onChange={(e) => setUploadTargetId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-600/10"
                >
                  <option value="">-- Select --</option>
                  {colleges.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Caption
                </label>
                <input
                  type="text"
                  placeholder="Brief description..."
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-600/10"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Category
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-600/10"
                >
                  <option value="infrastructure">Infrastructure</option>
                  <option value="clubs">Clubs</option>
                  <option value="events">Events</option>
                  <option value="others">Others</option>
                </select>
              </div>
            </div>

            <CompactAssetPicker
              title="Asset"
              file={uploadPhotoFile}
              onPick={(file) => setUploadPhotoFile(file)}
            />

            <button
              onClick={handleUpload}
              disabled={uploadInProgress}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,_#4f46e5,_#4338ca)] py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_-20px_rgba(79,70,229,0.9)] transition hover:translate-y-[-1px] disabled:opacity-50"
            >
              {uploadInProgress ? "Publishing..." : "Publish Asset"}
            </button>
          </div>

          <div className="hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] p-7 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.25)] lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">
                  Publishing Note
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                  Official push appears first
                </h3>
              </div>
              <p className="text-sm leading-7 text-slate-600 font-semibold">
                Official uploads are treated as curated visuals for the network. Use clean, high-quality images and add captions that will still read well on the public site.
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Visible Items
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  {galleryData.length}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Institutes
                </div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  {colleges.length}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grid View */}
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Manage Library
              </h2>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mt-1">
                Showing {selectedId === "all" ? "Entire Network" : "Target Institute"}
              </p>
            </div>

            <div className="group relative w-full sm:w-72">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-600">
                {selectedId === "all" ? <LayoutGrid size={16} /> : <Building2 size={16} />}
              </div>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm font-semibold text-slate-900 outline-none transition-all hover:border-indigo-300 focus:ring-2 focus:ring-indigo-600/10 cursor-pointer"
              >
                <option value="all">All Colleges (Entire Network)</option>
                <optgroup
                  label="Filter by College"
                  className="bg-white text-indigo-600 font-bold"
                >
                  {colleges.map((c) => (
                    <option
                      key={c._id}
                      value={c._id}
                      className="text-slate-900 font-medium"
                    >
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Filter size={14} />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : paginatedData.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedData.map((img, idx) => (
                <div
                  key={img.url + idx}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-2 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-[0_28px_60px_-38px_rgba(79,70,229,0.35)] flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-slate-100 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.caption || "Gallery photo"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3">
                        <div className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold text-slate-900 shadow-sm border border-slate-100">
                          {img.collegeName}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-3">
                      <input
                        type="text"
                        value={img.caption || ""}
                        onChange={(event) =>
                          handleGalleryFieldChange(
                            img.collegeId,
                            img.url,
                            "caption",
                            event.target.value
                          )
                        }
                        placeholder="Caption"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-600/10"
                      />
                      <select
                        value={img.category || ""}
                        onChange={(event) =>
                          handleGalleryFieldChange(
                            img.collegeId,
                            img.url,
                            "category",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 cursor-pointer"
                      >
                        {categoryOptions.map((option) => (
                          <option
                            key={option.value || "uncategorized"}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 pt-0">
                    <button
                      onClick={() => handleSaveImageMeta(img.collegeId, img)}
                      disabled={savingImageUrl === img.url}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[linear-gradient(135deg,_#4f46e5,_#4338ca)] px-3 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:opacity-50"
                    >
                      <Save size={13} />
                      {savingImageUrl === img.url ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => handleDelete(img.collegeId, img.url)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
              <Images size={32} className="text-slate-200 mb-4 animate-bounce" />
              <h2 className="text-sm font-bold text-slate-900">No photos found</h2>
              <p className="mt-1 text-[12px] text-slate-500 font-semibold">
                Try selecting a different institute.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-6 pb-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
              >
                Previous
              </button>
              <div className="text-sm font-semibold text-slate-400">
                Page <span className="font-bold text-slate-900">{currentPage}</span>{" "}
                of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

interface CompactAssetPickerProps {
  title: string;
  file: File | null;
  onPick: (file: File) => void;
}

function CompactAssetPicker({ title, file, onPick }: CompactAssetPickerProps) {
  const previewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : "";
  }, [file]);

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-indigo-100 hover:bg-white">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 relative">
          {file ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} className="h-full w-full object-cover" alt="preview" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-200">
              <Images size={20} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title} Asset</div>
          <div className="mt-1 flex items-center gap-2">
            <label className="cursor-pointer text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 hover:underline">
              {file ? "Change photo" : "Select photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const selected = event.target.files?.[0];
                  if (selected) onPick(selected);
                  event.target.value = "";
                }}
              />
            </label>
            {file && (
              <span className="text-[11px] text-slate-400 capitalize truncate block">
                {file.name.slice(0, 18)}...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
