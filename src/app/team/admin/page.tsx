"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { ITeamMember } from "@/types";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Upload,
  Search,
  ArrowUpDown,
  GripVertical,
  ShieldCheck,
  Users,
  ArrowLeft,
  Mail,
  Calendar,
  ArrowRight,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";

interface MemberForm {
  name: string;
  role: string;
  roleType: "EXEC" | "LEAD" | "MEMBER";
  iiit: string;
  email: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  currentCompany: string;
  location: string;
  aboutText: string;
  messageText: string;
  team: string;
  year: string;
  isActive: boolean;
  order: number;
}

const EMPTY: MemberForm = {
  name: "",
  role: "",
  roleType: "MEMBER",
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
  year: new Date().getFullYear().toString(),
  isActive: true,
  order: 0,
};

const TEAMS = ["Core", "Tech", "Development", "Design", "Content", "Social Media"];

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
      <div className="text-sm font-medium text-slate-600">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

export default function TeamAdminPage() {
  const [members, setMembers] = useState<ITeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Notifications
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters & Sorting
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [yearFilter, setYearFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Tab State: "active" ( roster ) or "pending" ( localStorage queue )
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const [mockRequests, setMockRequests] = useState<any[]>([]);

  // Drag & Drop States
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [orderedMembers, setOrderedMembers] = useState<ITeamMember[]>([]);

  const loadMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<ITeamMember[]>("/team");
      setMembers(res.data || []);
    } catch (err: any) {
      setError("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };

  const loadMockRequests = () => {
    if (typeof window !== "undefined") {
      const data = JSON.parse(localStorage.getItem("local-team-requests") || "[]");
      setMockRequests(data);
    }
  };

  useEffect(() => {
    loadMembers();
    loadMockRequests();
    if (typeof window !== "undefined") {
      window.addEventListener("focus", loadMockRequests);
      return () => window.removeEventListener("focus", loadMockRequests);
    }
  }, []);

  // Sync reordering helper state
  useEffect(() => {
    setOrderedMembers(members);
  }, [members]);

  const availableYears = useMemo(() => {
    return [...new Set(members.map((m) => m.year).filter(Boolean))].sort((a, b) =>
      b.localeCompare(a, undefined, { numeric: true })
    );
  }, [members]);

  const availableTeams = useMemo(() => {
    return [...new Set(members.map((m) => m.team).filter(Boolean))].sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    const list = [...orderedMembers];
    const normQuery = query.toLowerCase().trim();

    const searched = list.filter((m) => {
      const matchesQuery =
        !normQuery ||
        [m.name, m.role, m.iiit, m.team, m.year, m.roleType]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(normQuery));

      const matchesYear = yearFilter === "all" || m.year === yearFilter;
      const matchesTeam = teamFilter === "all" || m.team === teamFilter;
      const matchesRole = roleFilter === "all" || m.roleType === roleFilter;

      return matchesQuery && matchesYear && matchesTeam && matchesRole;
    });

    // Handle Sorting
    return [...searched].sort((a, b) => {
      const yearCompare = String(b.year || "").localeCompare(String(a.year || ""), undefined, {
        numeric: true,
      });

      const orderA = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
      const orderB = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;

      if (sortBy === "order") {
        if (orderA !== orderB) return orderA - orderB;
        if (yearCompare !== 0) return yearCompare;
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "") || yearCompare;
      }

      if (sortBy === "role") {
        return (a.role || "").localeCompare(b.role || "") || yearCompare;
      }

      if (sortBy === "team") {
        return (a.team || "").localeCompare(b.team || "") || yearCompare;
      }

      // Default: Latest tenure year first, then order, then name
      if (yearCompare !== 0) return yearCompare;
      if (orderA !== orderB) return orderA - orderB;
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [orderedMembers, query, sortBy, yearFilter, teamFilter, roleFilter]);

  const stats = useMemo(() => {
    const active = members.filter((m) => m.isActive !== false);
    return {
      total: members.length,
      active: active.length,
      execs: active.filter((m) => m.roleType === "EXEC").length,
      leads: active.filter((m) => m.roleType === "LEAD").length,
    };
  }, [members]);

  const openAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setPhotoFile(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEdit = (m: ITeamMember) => {
    setForm({
      name: m.name || "",
      role: m.role || "",
      roleType: m.roleType || "MEMBER",
      iiit: m.iiit || "",
      email: m.email || "",
      linkedin: m.linkedin || "",
      instagram: m.instagram || "",
      twitter: m.twitter || "",
      currentCompany: m.currentCompany || "",
      location: m.location || "",
      aboutText: m.aboutText || "",
      messageText: m.messageText || "",
      team: m.team || "Core",
      year: m.year || "",
      isActive: m.isActive ?? true,
      order: m.order ?? 0,
    });
    setEditId(m._id);
    setPhotoFile(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (photoFile) {
        fd.append("photo", photoFile);
      }

      if (editId) {
        // Correct endpoint should call PUT for updates on team route
        await api.put(`/team/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Team member details updated.");
      } else {
        await api.post("/team", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("New team member added.");
      }

      setShowForm(false);
      loadMembers();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to save team member details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/team/${id}`);
      setSuccess("Team member record deleted.");
      loadMembers();
    } catch (err: any) {
      setError("Failed to delete team member.");
    }
  };

  // Local Review approvals
  const handleApproveRequest = (req: any) => {
    // Fill the add form from mock data
    setForm({
      name: req.name || "",
      role: req.role || "",
      roleType: "MEMBER",
      iiit: req.iiit || "",
      email: req.email || "",
      linkedin: req.linkedin || "",
      instagram: req.instagram || "",
      twitter: req.twitter || "",
      currentCompany: "",
      location: "",
      aboutText: req.aboutText || "",
      messageText: req.messageText || "",
      team: req.team || "Core",
      year: req.year || new Date().getFullYear().toString(),
      isActive: true,
      order: 0,
    });
    setEditId(null);
    setPhotoFile(null);
    
    // Remove from mock requests list in LocalStorage
    const updated = mockRequests.filter((r) => r._id !== req._id);
    localStorage.setItem("local-team-requests", JSON.stringify(updated));
    setMockRequests(updated);

    // Redirect to active form
    setActiveTab("active");
    setShowForm(true);
    setSuccess(`Loaded application of ${req.name}. Please upload a photo to save them permanently.`);
  };

  const handleDeleteRequest = (id: string) => {
    if (!confirm("Remove this request permanently?")) return;
    const updated = mockRequests.filter((r) => r._id !== id);
    localStorage.setItem("local-team-requests", JSON.stringify(updated));
    setMockRequests(updated);
  };

  // HTML5 Drag & Drop reordering handlers
  const moveMember = (draggedMemberId: string, targetMemberId: string) => {
    if (!draggedMemberId || draggedMemberId === targetMemberId) return;

    setOrderedMembers((prev) => {
      const draggedIndex = prev.findIndex((m) => m._id === draggedMemberId);
      const targetIndex = prev.findIndex((m) => m._id === targetMemberId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const next = [...prev];
      const [draggedMember] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, draggedMember);
      return next;
    });
  };

  const handleDrop = async () => {
    if (!draggedId) return;
    const nextOrder = [...orderedMembers];
    setDraggedId(null);

    setSavingOrder(true);
    setError("");
    setSuccess("");
    try {
      // Parallelize update requests
      await Promise.all(
        nextOrder.map((member, index) => {
          const formData = new FormData();
          formData.append("order", String(index + 1));
          return api.put(`/team/${member._id}`, formData);
        })
      );

      setSuccess("Tenure order positions updated successfully.");
      loadMembers();
    } catch (err) {
      setError("Failed to save reorder updates.");
      loadMembers();
    } finally {
      setSavingOrder(false);
    }
  };

  const disableReorder =
    Boolean(query.trim()) ||
    savingOrder ||
    yearFilter !== "all" ||
    teamFilter !== "all" ||
    roleFilter !== "all";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Workspace Summary */}
        <section className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-700">
                <Users className="h-4 w-4" />
                Team Roster Hub
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Team Directory Management
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 font-semibold">
                Manage terms, display order coordinates, and verify member applications in one location.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4 shrink-0">
              <StatCard label="All Records" value={stats.total} />
              <StatCard label="Active Roster" value={stats.active} />
              <StatCard label="Executives" value={stats.execs} />
              <StatCard label="Leads" value={stats.leads} />
            </div>
          </div>
        </section>

        {/* Tab switch bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 rounded-[2rem] border border-slate-200 bg-white/50 p-2 shadow-sm backdrop-blur-sm">
            <button
              onClick={() => {
                setActiveTab("active");
                setError("");
                setSuccess("");
              }}
              className={`flex items-center gap-2 rounded-[1.4rem] px-5 py-2.5 text-sm font-bold transition ${
                activeTab === "active" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-white"
              }`}
            >
              Active Roster
            </button>
            <button
              onClick={() => {
                setActiveTab("pending");
                setError("");
                setSuccess("");
              }}
              className={`flex items-center gap-2 rounded-[1.4rem] px-5 py-2.5 text-sm font-bold transition relative ${
                activeTab === "pending" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-white"
              }`}
            >
              Pending Review
              {mockRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {mockRequests.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === "active" && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 hover:scale-[1.01] transition"
            >
              <Plus className="h-4 w-4" /> Add Team Member
            </button>
          )}
        </div>

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

        {/* Tab 1: Active Roster */}
        {activeTab === "active" && (
          <>
            {/* Filter controls */}
            <section className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search roster..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div className="relative">
                  <ArrowUpDown size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-xs font-semibold text-slate-700 outline-none focus:bg-white"
                  >
                    <option value="latest">Latest term first</option>
                    <option value="order">Manual order</option>
                    <option value="name">Sort: Name</option>
                    <option value="role">Sort: Role</option>
                    <option value="team">Sort: Team</option>
                  </select>
                </div>

                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white cursor-pointer"
                >
                  <option value="all">All Years</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white cursor-pointer"
                >
                  <option value="all">All Teams</option>
                  {availableTeams.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="EXEC">Executive</option>
                  <option value="LEAD">Lead</option>
                  <option value="MEMBER">Member</option>
                </select>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-indigo-50/60 p-3 text-xs text-indigo-900 border border-indigo-100 font-semibold">
                <GripVertical size={16} className="text-indigo-400 shrink-0" />
                <p>
                  Drag cards to set layout sorting order.
                  {disableReorder && (
                    <span className="text-rose-600 ml-1">
                      (Clear search filter selections to enable reordering)
                    </span>
                  )}
                </p>
              </div>
            </section>

            {/* List */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <p className="text-center text-sm font-semibold text-slate-400 py-10">No roster members match your filters.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredMembers.map((member) => (
                  <div
                    key={member._id}
                    draggable={!disableReorder}
                    onDragStart={() => !disableReorder && setDraggedId(member._id)}
                    onDragOver={(e) => !disableReorder && e.preventDefault()}
                    onDragEnter={() => !disableReorder && draggedId && moveMember(draggedId, member._id)}
                    onDrop={handleDrop}
                    onDragEnd={() => setDraggedId(null)}
                    className={`relative rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition ${
                      draggedId === member._id ? "opacity-60 ring-2 ring-indigo-300 scale-[0.98]" : ""
                    }`}
                  >
                    <div className="absolute right-3 top-3 flex gap-2">
                      <div
                        title={disableReorder ? "Clear filter search to reorder" : "Drag card position"}
                        className={`rounded-full border border-slate-200 bg-white p-2 transition shadow-sm shrink-0 ${
                          disableReorder
                            ? "cursor-not-allowed text-slate-200"
                            : "cursor-grab text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        <GripVertical size={14} />
                      </div>
                      <button
                        onClick={() => openEdit(member)}
                        className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition shadow-sm"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="rounded-full border border-slate-200 bg-white p-2 text-rose-600 hover:bg-rose-50 transition shadow-sm"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="mb-3 flex gap-4 shrink-0">
                      <div className="relative h-20 w-20 overflow-hidden rounded-[1.1rem] bg-slate-50 ring-1 ring-slate-100 shadow-sm shrink-0">
                        {member.photo?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.photo.url}
                            alt={member.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <Users size={24} />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-between py-0.5 min-w-0">
                        <div className="flex flex-wrap gap-1">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                            {member.roleType}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                            #{member.order || 0}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 truncate pr-16">{member.name}</h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest w-fit ${
                            member.isActive === false
                              ? "bg-slate-200 text-slate-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {member.isActive === false ? "inactive" : "active"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5 font-semibold">
                      <p className="text-slate-900 font-bold">{member.role}</p>
                      <p>{member.iiit}</p>
                      <p className="text-indigo-600">{member.team} · {member.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab 2: Pending Applications Queue */}
        {activeTab === "pending" && (
          <section className="space-y-6">
            <div className="rounded-[2rem] border border-indigo-100 bg-indigo-50/40 p-6 shadow-sm">
              <div className="flex flex-col items-center justify-center text-center py-4 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-indigo-100">
                  <ShieldCheck size={26} className="text-indigo-500" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Offline Sandbox Review Queue
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-1">
                    Applications submitted via the Join Team form are captured here locally. Approve them to open the configuration editor.
                  </p>
                </div>
              </div>
            </div>

            {mockRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center">
                <CheckCircle2 size={32} className="text-slate-200 mb-2 animate-bounce" />
                <h4 className="font-bold text-slate-900">No pending requests</h4>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Applications will appear here once submitted.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {mockRequests.map((req) => (
                  <article
                    key={req._id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center hover:border-indigo-200"
                  >
                    <div className="flex items-center gap-3 lg:w-1/4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm">
                        <UserPlus size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{req.name}</h4>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mt-0.5">
                          New Recruit
                        </span>
                      </div>
                    </div>

                    <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-4 text-xs font-semibold text-slate-600">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                        <p className="text-slate-900 truncate break-all">{req.email}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Target Team</span>
                        <p className="text-indigo-600 font-bold">{req.team}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Proposed Role</span>
                        <p className="text-slate-900 truncate">{req.role} ({req.year})</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Submission Date</span>
                        <p className="text-slate-500">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(req)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-600"
                      >
                        Approve & Config <ArrowRight size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(req._id)}
                        className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Modal Form */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <form
              onSubmit={handleSubmit}
              className="my-8 w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-lg">
                  {editId ? "Edit Team Member" : "Add Team Member"}
                </h3>
                <button type="button" onClick={() => setShowForm(false)}>
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Position / Role *</label>
                  <input
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. Lead Developer"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">IIIT Institute *</label>
                  <input
                    required
                    value={form.iiit}
                    onChange={(e) => setForm({ ...form, iiit: e.target.value })}
                    placeholder="e.g. IIIT Kota"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Role Authority Type</label>
                  <select
                    value={form.roleType}
                    onChange={(e) => setForm({ ...form, roleType: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="EXEC">EXEC</option>
                    <option value="LEAD">LEAD</option>
                    <option value="MEMBER">MEMBER</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Team</label>
                  <select
                    value={form.team}
                    onChange={(e) => setForm({ ...form, team: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white cursor-pointer"
                  >
                    {TEAMS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Tenure Year *</label>
                  <input
                    required
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="e.g. 2026"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Manual Order Position</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">LinkedIn Profile</label>
                  <input
                    value={form.linkedin}
                    onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Instagram Profile</label>
                  <input
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Twitter Handle</label>
                  <input
                    value={form.twitter}
                    onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Current Work / Placement</label>
                  <input
                    value={form.currentCompany}
                    onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
                    placeholder="e.g. SDE at Microsoft"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Bio / About Description</label>
                  <textarea
                    rows={2}
                    value={form.aboutText}
                    onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Upload className="inline h-3.5 w-3.5 mr-1" />
                  Roster Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  Active Member Status
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60 shadow-md"
              >
                {saving ? "Saving Member Record..." : editId ? "Update Member" : "Publish Member"}
              </button>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
