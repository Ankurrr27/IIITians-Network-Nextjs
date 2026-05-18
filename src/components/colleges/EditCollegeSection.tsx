import React, { useState, useMemo } from "react";
import { Building2, Images, Users, Pencil, Trash2, ExternalLink, Link2 } from "lucide-react";
import api from "@/lib/apiClient";
import type { ICollege, ClubLink, ITeamMember } from "@/types";
import StatusMessage from "./StatusMessage";
import { AssetPicker, MultiAssetPicker } from "./AssetPicker";

interface EditCollegeSectionProps {
  colleges: ICollege[];
  collegeLoading: boolean;
  teamMembers: ITeamMember[];
  onSuccess: () => void;
}

const COLLEGE_PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8'>No Image</text></svg>";

const initialCollegeForm = {
  name: "",
  website: "",
  clubLink: "",
  clubLinks: [{ name: "", url: "" }] as ClubLink[],
  description: "",
};

export default function EditCollegeSection({
  colleges,
  collegeLoading,
  teamMembers,
  onSuccess,
}: EditCollegeSectionProps) {
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState(initialCollegeForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const teamCountMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    teamMembers.forEach((member) => {
      const key = (member.iiit || "").trim().toLowerCase();
      if (!key) return;
      const uniqueMemberKey =
        (member.email || "").trim().toLowerCase() ||
        `${(member.name || "").trim().toLowerCase()}::${key}`;
      if (!uniqueMemberKey) return;
      if (!map.has(key)) {
        map.set(key, new Set());
      }
      map.get(key)!.add(uniqueMemberKey);
    });
    return map;
  }, [teamMembers]);

  const getCollegeTeamCount = (collegeName: string) =>
    teamCountMap.get((collegeName || "").trim().toLowerCase())?.size || 0;

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

  const startEdit = (college: ICollege) => {
    setEditId(college._id);
    setForm({
      name: college.name || "",
      website: college.website || "",
      clubLink: college.clubLink || "",
      clubLinks:
        college.clubLinks && college.clubLinks.length > 0
          ? college.clubLinks.map((item) => ({
              name: item.name || "",
              url: item.url || "",
            }))
          : [{ name: "", url: "" }],
      description: college.description || "",
    });
    setPhotoFile(null);
    setGalleryFiles([]);
    setLogoFile(null);
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditId("");
    setForm(initialCollegeForm);
    setPhotoFile(null);
    setGalleryFiles([]);
    setLogoFile(null);
  };

  const handleUpdate = async (id: string) => {
    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/colleges/${id}`, {
        name: form.name,
        website: form.website,
        clubLink: form.clubLink,
        clubLinks: sanitizeClubLinks(form.clubLinks),
        description: form.description,
      });

      await uploadAsset(id, "photo", photoFile);
      await uploadGallery(id, galleryFiles);
      await uploadAsset(id, "logo", logoFile);

      setEditId("");
      setForm(initialCollegeForm);
      setPhotoFile(null);
      setGalleryFiles([]);
      setLogoFile(null);
      setSuccess("College updated successfully.");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not update college.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" permanently?`))
      return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/colleges/${id}`);
      setSuccess("College removed successfully.");
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not remove college.");
    }
  };

  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
          <Building2 className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Edit colleges</h2>
      </div>

      {error && <StatusMessage tone="error">{error}</StatusMessage>}
      {success && <StatusMessage tone="success">{success}</StatusMessage>}

      <div className="grid gap-4 xl:grid-cols-2">
        {collegeLoading ? (
          <StatusMessage>Loading colleges...</StatusMessage>
        ) : colleges.length === 0 ? (
          <StatusMessage>No colleges found yet.</StatusMessage>
        ) : (
          colleges.map((college) => {
            const isEditing = editId === college._id;
            const existingGallery = college.gallery || [];
            const coverPhotos = [
              ...(college.photo?.url ? [college.photo] : []),
              ...existingGallery,
            ];
            const coverImage =
              college.photo?.url || existingGallery[0]?.url || COLLEGE_PLACEHOLDER;
            const mainPhotoUrl =
              (photoFile && isEditing
                ? URL.createObjectURL(photoFile)
                : college.photo?.url) || COLLEGE_PLACEHOLDER;
            const logoUrl =
              (logoFile && isEditing
                ? URL.createObjectURL(logoFile)
                : college.logo?.url) || COLLEGE_PLACEHOLDER;

            return (
              <div
                key={college._id}
                className="group flex flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[16/7] overflow-hidden bg-slate-50 border-b border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt={`${college.name} college`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>

                <div className="space-y-4 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200/80">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={logoUrl}
                            alt={`${college.name} logo`}
                            className="h-8 w-8 object-contain"
                          />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-slate-900">
                            {college.name}
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/70">
                              <Images className="h-3.5 w-3.5 text-indigo-500" />
                              {coverPhotos.length
                                ? `${coverPhotos.length} photo${coverPhotos.length > 1 ? "s" : ""}`
                                : "No college photos"}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
                              <Users className="h-3.5 w-3.5 text-emerald-500" />
                              {getCollegeTeamCount(college.name)} team members
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          isEditing ? cancelEdit() : startEdit(college)
                        }
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition shadow-sm ${
                          isEditing
                            ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {isEditing ? "Cancel" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(college._id, college.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <AssetPicker
                          title="Main college photo"
                          helper="This is the large public cover image."
                          file={photoFile}
                          existingUrl={mainPhotoUrl}
                          fallback={COLLEGE_PLACEHOLDER}
                          onPick={(file) => setPhotoFile(file)}
                        />
                        <AssetPicker
                          title="College logo"
                          helper="Smaller identity mark used near the college name."
                          file={logoFile}
                          existingUrl={logoUrl}
                          fallback={COLLEGE_PLACEHOLDER}
                          onPick={(file) => setLogoFile(file)}
                        />
                      </div>

                      <MultiAssetPicker
                        title="Extra gallery photos"
                        helper="Add more campus visuals."
                        files={galleryFiles}
                        existingUrls={existingGallery.map((item) => item.url)}
                        onPick={(files) => setGalleryFiles((prev) => [...prev, ...files])}
                      />

                      <div className="space-y-3">
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="College name (e.g. IIIT Kota)"
                          className="w-full rounded-2xl border border-stone-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10"
                        />
                        <input
                          type="text"
                          name="website"
                          value={form.website}
                          onChange={handleChange}
                          placeholder="Official website url"
                          className="w-full rounded-2xl border border-stone-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10"
                        />
                        <input
                          type="text"
                          name="clubLink"
                          value={form.clubLink}
                          onChange={handleChange}
                          placeholder="Student Portal / Login Link"
                          className="w-full rounded-2xl border border-stone-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10"
                        />
                      </div>

                      <div className="rounded-[1.4rem] bg-slate-50 p-4 ring-1 ring-slate-200/80">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 pb-2">
                          <div>
                            <div className="text-sm font-bold text-slate-900">Clubs and societies</div>
                            <div className="text-xs text-slate-500 font-semibold">Named links shown on the public college card.</div>
                          </div>
                          <button
                            type="button"
                            onClick={addClubLinkRow}
                            className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
                          >
                            Add Link
                          </button>
                        </div>

                        <div className="mt-3 space-y-3">
                          {form.clubLinks.map((item, index) => (
                            <div key={`edit-club-link-${index}`} className="grid gap-3 md:grid-cols-[0.8fr_1.2fr_auto]">
                              <input
                                type="text"
                                placeholder="e.g. E-Cell IIIT Kota"
                                value={item.name}
                                onChange={(event) =>
                                  handleClubLinkChange(index, "name", event.target.value)
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2"
                              />
                              <input
                                type="text"
                                placeholder="e.g. https://linktr.ee/ecelliiitkota"
                                value={item.url}
                                onChange={(event) =>
                                  handleClubLinkChange(index, "url", event.target.value)
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-2"
                              />
                              <button
                                type="button"
                                onClick={() => removeClubLinkRow(index)}
                                className="rounded-2xl border border-slate-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <textarea
                        name="description"
                        rows={4}
                        value={form.description}
                        onChange={handleChange}
                        placeholder="College description..."
                        className="w-full rounded-2xl border border-stone-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-relaxed text-slate-700 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/10"
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdate(college._id)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
                        >
                          <Pencil className="h-4 w-4" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {college.description ? (
                        <p className="text-sm leading-relaxed text-slate-600 font-semibold">
                          {college.description}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400 font-semibold italic">
                          No description added yet.
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {college.website && (
                          <a
                            href={college.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Website
                          </a>
                        )}
                        {college.clubLinks && college.clubLinks.length > 0
                          ? college.clubLinks
                              .filter((item) => item?.name && item?.url)
                              .map((item, index) => (
                                <a
                                  key={`${item.name}-${index}`}
                                  href={item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                                >
                                  <Link2 className="h-3.5 w-3.5 text-slate-400" />
                                  {item.name}
                                </a>
                              ))
                          : college.clubLink && (
                              <a
                                href={college.clubLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                              >
                                <Link2 className="h-3.5 w-3.5 text-slate-400" />
                                Club link
                              </a>
                            )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
