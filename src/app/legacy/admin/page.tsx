"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  XCircle,
  ArrowLeft,
  X,
  AlertCircle,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { IAlumni } from "@/types";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 sm:px-5 sm:py-4">
      <div className="font-semibold">{label}</div>
      <div className="mt-1 text-2xl font-semibold sm:text-3xl">{value}</div>
    </div>
  );
}

export default function LegacyAdminPage() {
  const router = useRouter();
  const [alumni, setAlumni] = useState<IAlumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState("");

  // Edit States
  const [editEntryId, setEditEntryId] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    iiit: "",
    generation: "",
    graduationYear: "",
    branch: "",
    networkPost: "",
    currentRole: "",
    currentCompany: "",
    location: "",
    linkedin: "",
    instagram: "",
    bio: "",
  });

  // Team Addition States
  const [teamEntryId, setTeamEntryId] = useState("");
  const [teamForm, setTeamForm] = useState({
    name: "",
    role: "",
    roleType: "MEMBER" as "EXEC" | "LEAD" | "MEMBER",
    iiit: "",
    email: "",
    linkedin: "",
    instagram: "",
    twitter: "",
    currentCompany: "",
    location: "",
    aboutText: "",
    messageText: "",
    team: "Core",
    year: "",
    order: 0,
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<IAlumni[]>("/alumni/admin/requests", {
        params: { status: statusFilter, search },
      });
      setAlumni(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load legacy requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const stats = useMemo(() => {
    const total = alumni.length;
    const pending = alumni.filter((a) => (a.status || "approved") === "pending").length;
    const approved = alumni.filter((a) => (a.status || "approved") === "approved").length;
    const rejected = alumni.filter((a) => (a.status || "approved") === "rejected").length;

    return { total, pending, approved, rejected };
  }, [alumni]);

  const setStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api.patch(`/alumni/${id}/status`, { status });
      setSuccess(`Profile status updated to ${status}.`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile status.");
    } finally {
      setBusyId("");
    }
  };

  const deleteAlumni = async (id: string) => {
    if (!confirm("Delete this profile permanently?")) return;
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/alumni/${id}`);
      setSuccess("Profile deleted successfully.");
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete profile.");
    } finally {
      setBusyId("");
    }
  };

  const startEdit = (entry: IAlumni) => {
    setEditEntryId(entry._id);
    setEditForm({
      name: entry.name || "",
      email: entry.email || "",
      iiit: entry.iiit || "",
      generation: entry.generation || "",
      graduationYear: String(entry.graduationYear || ""),
      branch: entry.branch || "",
      networkPost: entry.networkPost || "",
      currentRole: entry.currentRole || "",
      currentCompany: entry.currentCompany || "",
      location: entry.location || "",
      linkedin: entry.linkedin || "",
      instagram: entry.instagram || "",
      bio: entry.bio || "",
    });
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditEntryId("");
    setError("");
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (id: string) => {
    setBusyId(id);
    setError("");
    setSuccess("");
    try {
      await api.patch(`/alumni/admin/${id}`, {
        ...editForm,
        graduationYear: Number(editForm.graduationYear),
      });
      setSuccess("Profile details updated.");
      setEditEntryId("");
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setBusyId("");
    }
  };

  const startAddToTeam = (entry: IAlumni) => {
    setTeamEntryId(entry._id);
    setTeamForm({
      name: entry.name || "",
      role: entry.networkPost || entry.currentRole || "",
      roleType: "MEMBER",
      iiit: entry.iiit || "",
      email: entry.email || "",
      linkedin: entry.linkedin || "",
      instagram: entry.instagram || "",
      twitter: entry.twitter || "",
      currentCompany: entry.currentCompany || "",
      location: entry.location || "",
      aboutText: entry.bio || "",
      messageText: entry.bio || "",
      team: "Core",
      year: entry.generation || new Date().getFullYear().toString(),
      order: 0,
    });
    setError("");
    setSuccess("");
  };

  const cancelAddToTeam = () => {
    setTeamEntryId("");
  };

  const handleTeamFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTeamForm((prev) => ({
      ...prev,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

  const handleAddToTeam = async (entry: IAlumni) => {
    setBusyId(entry._id);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      Object.entries(teamForm).forEach(([key, value]) =>
        formData.append(key, String(value))
      );

      if (entry.photo?.url) {
        formData.append("photoSourceAlumniId", entry._id);
      }

      await api.post("/team", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(`Added ${entry.name} to the team history successfully.`);
      cancelAddToTeam();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Could not add this legacy profile into team history."
      );
    } finally {
      setBusyId("");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Block */}
        <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-indigo-100 bg-white/80 text-indigo-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-indigo-700 hover:shadow-md active:scale-95"
                >
                  <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
                </button>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-700">
                  <ShieldCheck className="h-4 w-4" />
                  Network Legacy Moderation
                </div>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Legacy Directory Admin
              </h1>
              <p className="mt-2 text-sm text-slate-600 font-semibold leading-relaxed">
                Review submissions, update profile verification status, and manage the alumni directory.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <StatCard label="Total requests" value={stats.total} />
              <StatCard label="Pending" value={stats.pending} />
              <StatCard label="Approved" value={stats.approved} />
              <StatCard label="Rejected" value={stats.rejected} />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, college, company, or IIIT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-11 py-2.5 text-sm outline-none focus:border-indigo-600 focus:bg-white transition"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition ${
                    statusFilter === s
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

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
                <CheckCircle2 size={16} />
                {success}
              </div>
            )}
          </div>
        )}

        {/* Profiles Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {alumni.map((a) => {
              const effectiveStatus = a.status || "approved";
              const isEditing = editEntryId === a._id;
              const isAddingToTeam = teamEntryId === a._id;

              return (
                <article
                  key={a._id}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            ["name", "Name"],
                            ["email", "Email"],
                            ["iiit", "Institute"],
                            ["generation", "Generation / term"],
                            ["graduationYear", "Graduation year"],
                            ["branch", "Branch / team"],
                            ["networkPost", "Network post"],
                            ["currentRole", "Current role"],
                            ["currentCompany", "Current company"],
                            ["location", "Location"],
                            ["linkedin", "LinkedIn URL"],
                            ["instagram", "Instagram URL"],
                          ].map(([field, placeholder]) => (
                            <div key={field}>
                              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                {placeholder}
                              </label>
                              <input
                                type="text"
                                name={field}
                                value={(editForm as any)[field]}
                                onChange={handleEditChange}
                                placeholder={placeholder}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white"
                              />
                            </div>
                          ))}
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Legacy Message / Bio
                            </label>
                            <textarea
                              name="bio"
                              value={editForm.bio}
                              onChange={handleEditChange}
                              placeholder="Public text shown on the legacy card"
                              rows={3}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold text-slate-900">
                              {a.name}
                            </h3>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                effectiveStatus === "approved"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : effectiveStatus === "rejected"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {effectiveStatus}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1 text-sm text-slate-600">
                            {a.networkPost && <p>Network post: {a.networkPost}</p>}
                            {(a.currentRole || a.currentCompany) && (
                              <p>
                                {[a.currentRole, a.currentCompany]
                                  .filter(Boolean)
                                  .join(" at ")}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-100 px-3 py-1">
                              {a.iiit}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1">
                              {a.branch}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1">
                              {a.generation}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1">
                              Class of {a.graduationYear}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 md:w-[220px]">
                      <div className="font-semibold text-slate-900 truncate">
                        {isEditing ? editForm.email : a.email}
                      </div>
                      <div className="mt-1">
                        {isEditing
                          ? editForm.location || "Location not shared"
                          : a.location || "Location not shared"}
                      </div>
                      <div className="mt-2 space-y-0.5">
                        {(!isEditing ? a.linkedin : editForm.linkedin) && (
                          <div className="text-indigo-600">LinkedIn Connected</div>
                        )}
                        {(!isEditing ? a.instagram : editForm.instagram) && (
                          <div className="text-pink-600">Instagram Connected</div>
                        )}
                        <div className="text-slate-400 mt-2">
                          Submitted {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isEditing && a.bio && (
                    <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                      {a.bio}
                    </p>
                  )}

                  {isAddingToTeam && (
                    <div className="mt-5 rounded-[1.5rem] border border-indigo-100 bg-indigo-50/60 p-4 space-y-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Add to Team History
                        </p>
                        <p className="text-xs text-slate-500">
                          Configure term and details to migrate this profile to the live team page.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          name="name"
                          value={teamForm.name}
                          onChange={handleTeamFormChange}
                          placeholder="Name"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                        />
                        <input
                          name="role"
                          value={teamForm.role}
                          onChange={handleTeamFormChange}
                          placeholder="Role"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                        />
                        <select
                          name="roleType"
                          value={teamForm.roleType}
                          onChange={handleTeamFormChange}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                        >
                          <option value="EXEC">Executive</option>
                          <option value="LEAD">Lead</option>
                          <option value="MEMBER">Member</option>
                        </select>
                        <select
                          name="team"
                          value={teamForm.team}
                          onChange={handleTeamFormChange}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                        >
                          <option value="Core">Core</option>
                          <option value="Tech">Tech</option>
                          <option value="Development">Development</option>
                          <option value="Design">Design</option>
                          <option value="Content">Content</option>
                          <option value="Social Media">Social Media</option>
                        </select>
                        <input
                          name="year"
                          value={teamForm.year}
                          onChange={handleTeamFormChange}
                          placeholder="Tenure Year (e.g. 2026)"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                        />
                        <input
                          type="number"
                          name="order"
                          value={teamForm.order}
                          onChange={handleTeamFormChange}
                          placeholder="Display Order"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === a._id}
                          onClick={() => handleAddToTeam(a)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                          <PlusCircle size={14} /> Add to Team
                        </button>
                        <button
                          type="button"
                          onClick={cancelAddToTeam}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          disabled={busyId === a._id}
                          onClick={() => handleSaveEdit(a._id)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                          <Pencil size={14} /> Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(a)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          <Pencil size={12} /> Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => startAddToTeam(a)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          <PlusCircle size={12} /> Add to Team
                        </button>

                        {effectiveStatus !== "approved" && (
                          <button
                            type="button"
                            disabled={busyId === a._id}
                            onClick={() => setStatus(a._id, "approved")}
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} /> Approve
                          </button>
                        )}

                        {effectiveStatus !== "rejected" && (
                          <button
                            type="button"
                            disabled={busyId === a._id}
                            onClick={() => setStatus(a._id, "rejected")}
                            className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        )}

                        {effectiveStatus !== "pending" && (
                          <button
                            type="button"
                            disabled={busyId === a._id}
                            onClick={() => setStatus(a._id, "pending")}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                          >
                            <Clock3 size={12} /> Move to Pending
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={busyId === a._id}
                          onClick={() => deleteAlumni(a._id)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 ml-auto"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
            {alumni.length === 0 && (
              <p className="col-span-2 py-10 text-center text-sm text-slate-400">
                No legacy profiles found.
              </p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
