"use client";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { ICollege } from "@/types";
import { Trash2, Upload, Images } from "lucide-react";

interface GalleryPhoto {
  _id?: string;
  url: string;
  caption?: string;
  category?: string;
  createdAt?: string;
}

export default function AdminGalleryPage() {
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("others");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    api.get("/colleges").then((r) => setColleges([...r.data].sort((a: ICollege, b: ICollege) => a.name.localeCompare(b.name)))).finally(() => setLoading(false));
  }, []);

  const selected = useMemo(() => colleges.find((c) => c._id === selectedId), [colleges, selectedId]);
  const gallery: GalleryPhoto[] = selected?.gallery || [];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !files.length) { setMsg({ type: "error", text: "Select a college and at least one image." }); return; }
    setUploading(true); setMsg({ type: "", text: "" });
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      files.forEach(() => fd.append("captions", caption));
      files.forEach(() => fd.append("categories", category));
      await api.patch(`/colleges/${selectedId}/gallery`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      const r = await api.get("/colleges");
      setColleges([...r.data].sort((a: ICollege, b: ICollege) => a.name.localeCompare(b.name)));
      setFiles([]); setCaption(""); setCategory("others");
      setMsg({ type: "success", text: "Photos uploaded successfully!" });
    } catch (err: unknown) {
      setMsg({ type: "error", text: (err as { response?: { data?: { message?: string } } }).response?.data?.message || "Upload failed." });
    } finally { setUploading(false); }
  };

  const handleDelete = async (photoId: string) => {
    if (!selectedId || !confirm("Delete this photo?")) return;
    try {
      await api.delete(`/colleges/${selectedId}/gallery/${photoId}`);
      const r = await api.get("/colleges");
      setColleges([...r.data].sort((a: ICollege, b: ICollege) => a.name.localeCompare(b.name)));
      setMsg({ type: "success", text: "Photo deleted." });
    } catch { setMsg({ type: "error", text: "Failed to delete photo." }); }
  };

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Gallery Management</h2>

        {/* Upload Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-800 flex items-center gap-2"><Upload className="h-4 w-4 text-indigo-500" /> Upload Photos</h3>
          <form onSubmit={handleUpload} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">College</label>
                <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className={inputCls}>
                  <option value="">Select college…</option>
                  {colleges.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="clubs">Clubs</option>
                  <option value="events">Events</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-600">Caption</label>
                <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption for these photos" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-600">Images</label>
                <label className="flex min-h-[56px] cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 transition hover:border-indigo-300 hover:bg-white">
                  <span>{files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Choose images"}</span>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Browse</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { setFiles(Array.from(e.target.files || [])); e.target.value = ""; }} />
                </label>
              </div>
            </div>

            {msg.text && (
              <div className={`rounded-xl px-4 py-2.5 text-sm font-medium ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{msg.text}</div>
            )}

            <button type="submit" disabled={uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload Photos"}
            </button>
          </form>
        </section>

        {/* Gallery Preview */}
        {selected && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-slate-800 flex items-center gap-2">
              <Images className="h-4 w-4 text-indigo-500" />
              {selected.name} — {gallery.length} photo{gallery.length !== 1 ? "s" : ""}
            </h3>
            {gallery.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No photos yet. Upload some above.</p>
            ) : (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {gallery.map((photo) => (
                  <div key={photo._id || photo.url} className="group relative overflow-hidden rounded-xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url.replace("/upload/", "/upload/f_auto,q_auto,w_300/")} alt={photo.caption || "Gallery"} className="aspect-square w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 flex flex-col justify-between bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase text-white">{photo.category}</span>
                      <div className="flex items-end justify-between gap-1">
                        <p className="line-clamp-2 text-[11px] text-white">{photo.caption}</p>
                        {photo._id && (
                          <button onClick={() => handleDelete(photo._id!)} className="shrink-0 rounded-lg bg-rose-600 p-1.5 text-white transition hover:bg-rose-700">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {!selected && !loading && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center text-sm text-slate-400 shadow-sm">
            Select a college above to manage its gallery.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
