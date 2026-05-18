import React, { useState } from "react";
import { Building2, Plus, CheckCircle2 } from "lucide-react";
import api from "@/lib/apiClient";
import type { ClubLink } from "@/types";
import FormItem from "./FormItem";
import { AssetInlinePicker, MultiAssetInlinePicker } from "./AssetPicker";

interface CreateCollegeSectionProps {
  onSuccess: () => void;
}

const initialCollegeForm = {
  name: "",
  website: "",
  clubLink: "",
  clubLinks: [{ name: "", url: "" }] as ClubLink[],
  description: "",
};

export default function CreateCollegeSection({ onSuccess }: CreateCollegeSectionProps) {
  const [form, setForm] = useState(initialCollegeForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleClubLinkChange = (index: number, field: keyof ClubLink, value: string) => {
    setForm((prev) => ({
      ...prev,
      clubLinks: prev.clubLinks.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addClubLinkRow = () => {
    setForm((prev) => ({
      ...prev,
      clubLinks: [...prev.clubLinks, { name: "", url: "" }],
    }));
  };

  const removeClubLinkRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      clubLinks:
        prev.clubLinks.length === 1
          ? [{ name: "", url: "" }]
          : prev.clubLinks.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const sanitizeClubLinks = (links: ClubLink[] = []) =>
    links
      .map((item) => ({
        name: (item?.name || "").trim(),
        url: (item?.url || "").trim(),
      }))
      .filter((item) => item.name && item.url);

  const uploadAsset = async (collegeId: string, type: "photo" | "logo", file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);
    await api.patch(`/colleges/${collegeId}/${type}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const uploadGallery = async (collegeId: string, files: File[]) => {
    if (!files?.length) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    await api.patch(`/colleges/${collegeId}/gallery`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post<{ _id: string }>("/colleges", {
        ...form,
        clubLinks: sanitizeClubLinks(form.clubLinks),
      });

      const newCollegeId = response.data._id;
      await uploadAsset(newCollegeId, "photo", photoFile);
      await uploadGallery(newCollegeId, galleryFiles);
      await uploadAsset(newCollegeId, "logo", logoFile);

      setForm(initialCollegeForm);
      setPhotoFile(null);
      setGalleryFiles([]);
      setLogoFile(null);
      setSuccess("College added successfully to the network.");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not add college.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
          <Building2 className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Add college</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs font-semibold text-rose-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-semibold text-emerald-600">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormItem label="College Name">
            <input
              type="text"
              name="name"
              placeholder="e.g. IIIT Kota"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
            />
          </FormItem>
          <FormItem label="Official Website">
            <input
              type="text"
              name="website"
              placeholder="e.g. https://iiitkota.ac.in"
              value={form.website}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
            />
          </FormItem>
          <FormItem label="Student Portal / Login">
            <input
              type="text"
              name="clubLink"
              placeholder="e.g. https://students.iiit.ac.in"
              value={form.clubLink}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-600 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
            />
          </FormItem>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormItem label="Main Cover Photo">
            <AssetInlinePicker
              title="Choose Cover"
              file={photoFile}
              onPick={(file) => setPhotoFile(file)}
            />
          </FormItem>
          <FormItem label="Experience Gallery">
            <MultiAssetInlinePicker
              title="Add Photos"
              files={galleryFiles}
              onPick={(files) => setGalleryFiles((prev) => [...prev, ...files])}
            />
          </FormItem>
          <FormItem label="Official Logo">
            <AssetInlinePicker
              title="Choose Logo"
              file={logoFile}
              onPick={(file) => setLogoFile(file)}
            />
          </FormItem>
        </div>

        <FormItem label="Short Description">
          <textarea
            name="description"
            rows={3}
            placeholder="e.g. A fast-growing IIIT known for strong coding culture and active communities..."
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm leading-relaxed text-slate-700 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 font-semibold"
          />
        </FormItem>

        <div className="rounded-[1.4rem] bg-indigo-50/30 p-5 ring-1 ring-indigo-100/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900">Featured Clubs & Societies</div>
              <div className="text-[11px] font-bold text-slate-500">
                Add named links that will appear directly on the college card.
              </div>
            </div>
            <button
              type="button"
              onClick={addClubLinkRow}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              <Plus size={14} />
              Add Society
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {form.clubLinks.map((item, index) => (
              <div key={`create-club-link-${index}`} className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="e.g. GDSC IIIT Kota"
                    value={item.name}
                    onChange={(event) =>
                      handleClubLinkChange(index, "name", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
                <div className="flex-[1.5]">
                  <input
                    type="text"
                    placeholder="e.g. https://linktr.ee/gdsciiitkota"
                    value={item.url}
                    onChange={(event) =>
                      handleClubLinkChange(index, "url", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeClubLinkRow(index)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-rose-50 px-5 text-sm font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="group inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              "Publishing..."
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Add College to Network
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
