"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import { AdminHeader, AdminStatCard } from "@/components/admin/AdminHeader";
import { AdminCard, AdminCardHeader } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/AdminInput";
import { AdminTable, AdminTableHeader, AdminTh, AdminTableBody, AdminTableRow, AdminTd, AdminBadge } from "@/components/admin/AdminTable";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import type { ITeamMember } from "@/types";
import { Plus, Trash2, Pencil, Users, AlertCircle, CheckCircle2, Copy, TrendingUp, Search, BriefcaseBusiness, UserCheck, XCircle, X, Archive } from "lucide-react";
import AdminActionModal from "@/components/admin/AdminActionModal";
import { compareTermsNewestFirst } from "@/lib/termSort";

interface TeamRequest {
  _id: string;
  applicantType: "NEW" | "EXISTING";
  name: string;
  email: string;
  iiit: string;
  team: string;
  role: string;
  year: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  aboutText?: string;
  messageText?: string;
  photo?: { url?: string };
  createdAt?: string;
}

type TeamRequestForm = Pick<TeamRequest, "name" | "email" | "iiit" | "team" | "role" | "year" | "linkedin" | "instagram" | "twitter" | "aboutText" | "messageText">;

const emptyRequestForm: TeamRequestForm = {
  name: "", email: "", iiit: "", team: "", role: "", year: "",
  linkedin: "", instagram: "", twitter: "", aboutText: "", messageText: "",
};

export default function TeamAdminPage() {
  const [members, setMembers] = useState<ITeamMember[]>([]);
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [reviewingRequest, setReviewingRequest] = useState<TeamRequest | null>(null);
  const [requestForm, setRequestForm] = useState<TeamRequestForm>(emptyRequestForm);
  const [reviewError, setReviewError] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [terms, setTerms] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"team" | "copy" | "promote" | "positions" | "requests">("team");

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Clone Term State
  const [cloneForm, setCloneForm] = useState({ sourceTermId: "", newTermName: "", startDate: "", endDate: "" });
  const [termForm, setTermForm] = useState({ name: "", startDate: "", endDate: "" });
  const [roles, setRoles] = useState<Array<{ _id: string; name: string; level: number; roleType: string }>>([]);
  const [roleForm, setRoleForm] = useState({ name: "", roleType: "MEMBER", level: "10" });
  
  // Bulk Promote State
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]);
  const [promoteForm, setPromoteForm] = useState({ newRoleId: "", reason: "" });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [termFilter, setTermFilter] = useState("all");
  const [searchField, setSearchField] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"promote" | "copy">("promote");
  const [modalMemberId, setModalMemberId] = useState<string | undefined>(undefined);
  const loadMembers = async () => {
    setLoading(true);
    try {
      const [membersResult, termsResult, rolesResult, requestsResult, legacySyncResult] = await Promise.allSettled([
        api.get<ITeamMember[]>("/team"),
        api.get("/admin/terms"),
        api.get("/admin/roles"),
        api.get<TeamRequest[]>("/team-requests"),
        api.post("/admin/team/legacy-sync"),
      ]);
      if (membersResult.status === "rejected") throw membersResult.reason;
      setMembers(membersResult.value.data || []);
      if (termsResult.status === "fulfilled") setTerms(termsResult.value.data || []);
      if (rolesResult.status === "fulfilled") setRoles(rolesResult.value.data || []);
      if (requestsResult.status === "fulfilled") setRequests(requestsResult.value.data || []);
      else setError("Could not load incoming requests. Check the admin session and retry.");
      if (legacySyncResult.status === "rejected") {
        setError("Could not sync existing team profiles to Legacy.");
      }
    } catch (err: any) {
      setError("Failed to load team members.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadMembers(); }, []);

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const fields: Record<string, (member: ITeamMember) => string> = {
      name: (member) => member.name || "",
      email: (member) => member.email || "",
      role: (member) => member.role || "",
      team: (member) => member.team || "",
      year: (member) => member.year || "",
      status: (member) => member.isActive ? "active" : "archived",
    };
    const results = members.filter((member) => {
      if (termFilter !== "all" && member.year !== termFilter) return false;
      if (!normalizedQuery) return true;
      const values = searchField === "all" ? Object.values(fields).map((getValue) => getValue(member)) : [fields[searchField](member)];
      return values.some((value) => value.toLowerCase().includes(normalizedQuery));
    });
    const getSortValue = fields[sortField];
    return results.sort((left, right) => {
      if (sortField === "tenure") {
        const statusOrder = Number(Boolean(right.isActive)) - Number(Boolean(left.isActive));
        if (statusOrder !== 0) return statusOrder;
        const termOrder = compareTermsNewestFirst(left.year || "", right.year || "");
        return sortDirection === "desc" ? termOrder : -termOrder;
      }
      const comparison = getSortValue(left).localeCompare(getSortValue(right), undefined, { numeric: true, sensitivity: "base" });
      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [members, query, termFilter, searchField, sortField, sortDirection]);
  const activeMemberCount = new Set(
    members.filter((member) => member.isActive).map((member) => member.memberId || member._id)
  ).size;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (photoFile) fd.append("photo", photoFile);

      if (editId) {
        await api.put(`/team/${editId}`, fd);
        setSuccess("Team member updated.");
      } else {
        await api.post("/team", fd);
        setSuccess("New team member added.");
      }
      setShowForm(false);
      loadMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save team member details.");
    }
  };

  const handleCloneTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/team/terms/clone", cloneForm);
      setSuccess("Term cloned successfully.");
      setCloneForm({ sourceTermId: "", newTermName: "", startDate: "", endDate: "" });
      loadMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to clone term.");
    }
  };

  const handleCreateTerm = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(""); setSuccess("");
    try {
      const response = await api.post("/admin/terms", termForm);
      setTerms((previous) => [response.data, ...previous].sort((left, right) => compareTermsNewestFirst(left.name, right.name)));
      setTermForm({ name: "", startDate: "", endDate: "" });
      setSuccess(`Term ${response.data.name} created.`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not create term.");
    }
  };

  const handleCreateRole = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(""); setSuccess("");
    try {
      const response = await api.post("/admin/roles", { ...roleForm, level: Number(roleForm.level) });
      setRoles((previous) => [...previous, response.data].sort((a, b) => b.level - a.level));
      setRoleForm({ name: "", roleType: "MEMBER", level: "10" });
      setSuccess(`Position ${response.data.name} created.`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not create position.");
    }
  };

  const handleBulkPromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPromotions.length === 0) return setError("Select members to promote.");
    try {
      const promotions = selectedPromotions.map(id => ({ tenureId: id, newRoleId: promoteForm.newRoleId, reason: promoteForm.reason }));
      await api.post("/team/promote/bulk", { promotions });
      setSuccess("Bulk promotion successful.");
      setSelectedPromotions([]);
      loadMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to promote.");
    }
  };

  const openAdd = () => {
    setForm({ name: "", email: "", role: "Member", roleType: "MEMBER", team: "Core", year: new Date().getFullYear().toString(), iiit: "", linkedin: "", instagram: "", twitter: "", currentCompany: "", location: "", aboutText: "", messageText: "" });
    setEditId(null);
    setPhotoFile(null);
    setShowForm(true);
  };

  const openEdit = (member: ITeamMember) => {
    setForm({
      name: member.name || "",
      email: member.email || "",
      iiit: member.iiit || "",
      role: member.role || "Member",
      roleType: member.roleType || "MEMBER",
      team: member.team || "Core",
      year: member.year || "",
      linkedin: member.linkedin || "",
      instagram: member.instagram || "",
      twitter: member.twitter || "",
      currentCompany: member.currentCompany || "",
      location: member.location || "",
      aboutText: member.aboutText || "",
      messageText: member.messageText || "",
    });
    setEditId(member.memberId || member._id);
    setPhotoFile(null);
    setShowForm(true);
  };

  const removeFromTerm = async (member: ITeamMember) => {
    const ok = window.confirm(`Remove ${member.name} from active team terms? Their profile will be kept for history.`);
    if (!ok) return;
    setError(""); setSuccess("");
    try {
      await api.post("/admin/team/actions", {
        action: "remove",
        memberId: member.memberId || member._id,
        tenureId: member.memberId && member._id !== member.memberId ? member._id : undefined,
      });
      setSuccess(`${member.name} removed from active terms.`);
      loadMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not remove this member from the active term.");
    }
  };

  const deleteMemberCompletely = async (member: ITeamMember) => {
    const ok = window.confirm(`Permanently delete ${member.name}, all team terms and promotion history, pending requests, and their team-only Legacy profile? This cannot be undone.`);
    if (!ok) return;
    const memberId = member.memberId || member._id;
    setError(""); setSuccess("");
    try {
      await api.delete(`/team/${memberId}`);
      setMembers((previous) => previous.filter((item) => (item.memberId || item._id) !== memberId));
      setSuccess(`${member.name} and all linked team records were permanently deleted.`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not permanently delete this team member.");
    }
  };

  const openRequestReview = (request: TeamRequest) => {
    setReviewingRequest(request);
    setRequestForm({
      name: request.name || "",
      email: request.email || "",
      iiit: request.iiit || "",
      team: request.team || "",
      role: request.role || "",
      year: request.year || "",
      linkedin: request.linkedin || "",
      instagram: request.instagram || "",
      twitter: request.twitter || "",
      aboutText: request.aboutText || "",
      messageText: request.messageText || "",
    });
    setReviewError("");
  };

  const reviewRequest = async (request: TeamRequest, action: "accept" | "reject", updates?: TeamRequestForm) => {
    setError(""); setSuccess("");
    setReviewError("");
    setReviewSaving(true);
    try {
      await api.patch(`/team-requests/${request._id}`, { action, updates });
      setRequests((previous) => previous.filter((item) => item._id !== request._id));
      setSuccess(action === "accept" ? `${request.name} was added to the team.` : `${request.name}'s request was declined.`);
      setReviewingRequest(null);
      if (action === "accept") loadMembers();
    } catch (err: any) {
      const message = err.response?.data?.message || `Could not ${action} this request.`;
      if (action === "accept") setReviewError(message);
      else setError(message);
    } finally {
      setReviewSaving(false);
    }
  };

  if (loading) {
    return <AdminLayout><div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <AdminHeader
          title="Team Management"
          description="Manage active team members, copy teams from previous years, and promote members."
          badge="Team Settings"
          icon={Users}
          stats={
            <div className="flex gap-2">
              <AdminStatCard label="Total Active" value={activeMemberCount} color="indigo" />
            </div>
          }
          actions={<AdminButton size="sm" onClick={openAdd} icon={Plus}>Add Member</AdminButton>}
        />

        <AdminSectionTabs
          active={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: "team", label: "Team Members", icon: Users, count: new Set(members.map((member) => member.memberId || member._id)).size },
            { id: "copy", label: "Copy Previous Team", icon: Copy },
            { id: "promote", label: "Promote Members", icon: TrendingUp },
            { id: "positions", label: "Positions", icon: BriefcaseBusiness, count: roles.length },
            { id: "requests", label: "Incoming Requests", icon: UserCheck, count: requests.length },
          ]}
        />

        {(error || success) && (
          <div className="space-y-2 mb-4">
            {error && <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-600"><AlertCircle className="h-4 w-4"/> {error}</div>}
            {success && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4"/> {success}</div>}
          </div>
        )}

        {activeTab === "team" && (
          <>
            <AdminCard className="mb-4">
              <div className="grid items-end gap-3 md:grid-cols-[minmax(0,1fr)_10rem_10rem_10rem_9rem]">
                <div className="relative min-w-0">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search team members..." value={query} onChange={e => setQuery(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-10 text-sm outline-none focus:border-indigo-600" />
                </div>
                <AdminSelect label="Search in" value={searchField} onChange={(event) => setSearchField(event.target.value)} options={[{ label: "All fields", value: "all" }, { label: "Name", value: "name" }, { label: "Email", value: "email" }, { label: "Role", value: "role" }, { label: "Team", value: "team" }, { label: "Term", value: "year" }, { label: "Status", value: "status" }]} />
                <AdminSelect label="Term" value={termFilter} onChange={(event) => setTermFilter(event.target.value)} options={[{ label: "All terms", value: "all" }, ...terms.map((term) => ({ label: term.name, value: term.name }))]} />
                <AdminSelect label="Sort by" value={sortField} onChange={(event) => { setSortField(event.target.value); if (event.target.value === "tenure") setSortDirection("desc"); }} options={[{ label: "Name", value: "name" }, { label: "Role", value: "role" }, { label: "Team", value: "team" }, { label: "Term", value: "year" }, { label: "Status", value: "status" }, { label: "Tenure", value: "tenure" }]} />
                <AdminSelect label="Order" value={sortDirection} onChange={(event) => setSortDirection(event.target.value)} options={sortField === "tenure" ? [{ label: "Newest first", value: "desc" }, { label: "Oldest first", value: "asc" }] : [{ label: "A to Z", value: "asc" }, { label: "Z to A", value: "desc" }]} />
              </div>
            </AdminCard>

            <AdminTable>
              <AdminTableHeader>
                <AdminTh>Member</AdminTh>
                <AdminTh>Role / Team</AdminTh>
                <AdminTh>Term</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh className="min-w-lg">Actions</AdminTh>
              </AdminTableHeader>
              <AdminTableBody>
                {filteredMembers.map((m) => (
                  <AdminTableRow key={m._id}>
                    <AdminTd>
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-xs text-slate-500">{m.email}</div>
                    </AdminTd>
                    <AdminTd>
                      <div className="font-semibold text-slate-900">{m.role}</div>
                      <div className="text-xs text-slate-500">{m.team}</div>
                    </AdminTd>
                    <AdminTd><AdminBadge color="indigo">{m.year}</AdminBadge></AdminTd>
                    <AdminTd>
                      <AdminBadge color={m.isActive ? "emerald" : m.tenureStatus === "PROMOTED" ? "amber" : m.tenureStatus === "REMOVED" ? "rose" : "slate"}>
                        {m.tenureStatus === "PROMOTED" ? "Promoted" : m.tenureStatus === "REMOVED" ? "Removed" : m.isActive ? "Active" : "Archived"}
                      </AdminBadge>
                    </AdminTd>
                    <AdminTd className="whitespace-nowrap">
                      <div className="flex w-max flex-nowrap items-center gap-1.5">
                        <AdminButton size="sm" variant="outline" icon={Pencil} onClick={() => openEdit(m)}>Edit</AdminButton>
                        <AdminButton size="sm" variant="outline" icon={TrendingUp} onClick={() => { setModalAction("promote"); setModalMemberId(m.memberId || m._id); setModalOpen(true); }}>Promote</AdminButton>
                        <AdminButton size="sm" variant="outline" icon={Copy} onClick={() => { setModalAction("copy"); setModalMemberId(m.memberId || m._id); setModalOpen(true); }}>Copy</AdminButton>
                        <AdminButton size="sm" variant="outline" icon={Archive} disabled={!m.isActive} onClick={() => removeFromTerm(m)}>End term</AdminButton>
                        <AdminButton size="sm" variant="danger" icon={Trash2} onClick={() => deleteMemberCompletely(m)}>Delete</AdminButton>
                      </div>
                    </AdminTd>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          </>
        )}

        {activeTab === "requests" && (
          <AdminCard>
            <AdminCardHeader title="Incoming Team Requests" description="Sorted by requested tenure, newest first. Accept adds the applicant to the selected team term." />
            {requests.length === 0 ? (
              <p className="py-6 text-sm text-slate-500">No pending requests.</p>
            ) : (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTh>Applicant</AdminTh>
                  <AdminTh>Requested position</AdminTh>
                  <AdminTh>Tenure</AdminTh>
                  <AdminTh>Request type</AdminTh>
                  <AdminTh className="whitespace-nowrap">Actions</AdminTh>
                </AdminTableHeader>
                <AdminTableBody>
                  {requests.map((request) => (
                    <AdminTableRow key={request._id}>
                      <AdminTd>
                        <p className="font-semibold text-slate-900">{request.name}</p>
                        <p className="text-xs text-slate-500">{request.email} · {request.iiit || "IIIT unspecified"}</p>
                      </AdminTd>
                      <AdminTd>
                        <p className="font-semibold text-slate-900">{request.role}</p>
                        <p className="text-xs text-slate-500">{request.team}</p>
                      </AdminTd>
                      <AdminTd><AdminBadge color="indigo">{request.year}</AdminBadge></AdminTd>
                      <AdminTd><AdminBadge color={request.applicantType === "NEW" ? "sky" : "amber"}>{request.applicantType === "NEW" ? "New member" : "Existing member"}</AdminBadge></AdminTd>
                      <AdminTd className="whitespace-nowrap">
                        <div className="flex w-max flex-nowrap items-center gap-2">
                          <AdminButton size="sm" icon={UserCheck} onClick={() => openRequestReview(request)}>Review & Accept</AdminButton>
                          <AdminButton size="sm" variant="danger" icon={XCircle} onClick={() => reviewRequest(request, "reject")}>Decline</AdminButton>
                        </div>
                      </AdminTd>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            )}
          </AdminCard>
        )}

        {activeTab === "copy" && (
          <div className="grid gap-4 xl:grid-cols-2">
            <AdminCard>
              <AdminCardHeader title="Copy Previous Team" description="Copy all active assignments from a selected term into a new term." />
              <form onSubmit={handleCloneTerm} className="max-w-lg space-y-4">
                <AdminSelect label="Source term" required value={cloneForm.sourceTermId} onChange={e => setCloneForm({...cloneForm, sourceTermId: e.target.value})} options={[{ label: "Select a term", value: "" }, ...terms.map((term) => ({ label: term.name, value: term._id }))]} />
                <AdminInput label="New term name" required value={cloneForm.newTermName} onChange={e => setCloneForm({...cloneForm, newTermName: e.target.value})} placeholder="e.g. 2026-27" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminInput type="date" label="Start date" required value={cloneForm.startDate} onChange={e => setCloneForm({...cloneForm, startDate: e.target.value})} />
                  <AdminInput type="date" label="End date" required value={cloneForm.endDate} onChange={e => setCloneForm({...cloneForm, endDate: e.target.value})} />
                </div>
                <AdminButton type="submit" icon={Copy}>Copy team to new term</AdminButton>
              </form>
            </AdminCard>

            <AdminCard>
              <AdminCardHeader title="Terms" description="Create academic terms such as 2026 or 2026-27. New terms become available for promotions and member copies." />
              <form onSubmit={handleCreateTerm} className="space-y-4">
                <AdminInput label="Term name" required value={termForm.name} onChange={e => setTermForm({...termForm, name: e.target.value})} placeholder="2026-27" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminInput type="date" label="Start date" required value={termForm.startDate} onChange={e => setTermForm({...termForm, startDate: e.target.value})} />
                  <AdminInput type="date" label="End date" required value={termForm.endDate} onChange={e => setTermForm({...termForm, endDate: e.target.value})} />
                </div>
                <AdminButton type="submit" icon={Plus}>Add term</AdminButton>
              </form>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="mb-2 text-sm font-bold text-slate-800">Available terms</h3>
                <div className="flex flex-wrap gap-2">
                  {terms.map((term) => <AdminBadge key={term._id} color="indigo">{term.name}</AdminBadge>)}
                  {terms.length === 0 && <p className="text-sm text-slate-500">No terms yet.</p>}
                </div>
              </div>
            </AdminCard>
          </div>
        )}

        {activeTab === "promote" && (
          <AdminCard>
            <AdminCardHeader title="Promote Members" description="Select multiple active members to promote them to a new role." />
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-slate-700">Select Members ({selectedPromotions.length} selected)</h4>
                <div className="max-h-100 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 custom-scrollbar">
                  {members.filter((member) => member.isActive).map((m) => (
                    <label key={m._id} className="flex items-center p-3 hover:bg-slate-50 cursor-pointer gap-3">
                      <input type="checkbox" checked={selectedPromotions.includes(m._id)} onChange={(e) => {
                        if (e.target.checked) setSelectedPromotions(p => [...p, m._id]);
                        else setSelectedPromotions(p => p.filter(id => id !== m._id));
                      }} className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{m.name}</div>
                        <div className="text-xs text-slate-500">{m.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" title="Promote" onClick={() => { setModalAction("promote"); setModalMemberId(m.memberId || m._id); setModalOpen(true); }} className="rounded px-2 py-1 text-xs bg-amber-50 text-amber-600">Promote</button>
                        <button type="button" title="Copy to Term" onClick={() => { setModalAction("copy"); setModalMemberId(m.memberId || m._id); setModalOpen(true); }} className="rounded px-2 py-1 text-xs bg-sky-50 text-sky-600">Copy</button>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
                <div className="w-full sm:w-80">
                  <form onSubmit={handleBulkPromote} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <AdminSelect label="Target position" required value={promoteForm.newRoleId} onChange={e => setPromoteForm({...promoteForm, newRoleId: e.target.value})} options={[{ label: "Select position", value: "" }, ...roles.map((role) => ({ label: role.name, value: role._id }))]} />
                    <AdminTextarea label="Reason (optional)" value={promoteForm.reason} onChange={e => setPromoteForm({...promoteForm, reason: e.target.value})} placeholder="Promotion reason or note" />
                    <AdminButton type="submit">Promote Selected</AdminButton>
                  </form>
                </div>

            </div>
          </AdminCard>
        )}

        {activeTab === "positions" && (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
            <AdminCard>
              <AdminCardHeader title="Promotion positions" description="These positions appear in Promote and Copy dialogs. Add custom positions as your team structure changes." />
              <div className="divide-y divide-slate-100">
                {roles.map((role) => (
                  <div key={role._id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{role.name}</p>
                      <p className="text-xs text-slate-500">{role.roleType === "EXEC" ? "Executive" : role.roleType === "LEAD" ? "Lead" : "Member"} · level {role.level}</p>
                    </div>
                    <AdminBadge color={role.roleType === "EXEC" ? "indigo" : role.roleType === "LEAD" ? "sky" : "slate"}>{role.roleType}</AdminBadge>
                  </div>
                ))}
              </div>
            </AdminCard>
            <AdminCard>
              <AdminCardHeader title="Add position" description="Set the position name, team tier, and promotion order." />
              <form onSubmit={handleCreateRole} className="space-y-4">
                <AdminInput label="Position name" required value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} placeholder="e.g. Design Lead" />
                <AdminSelect label="Team tier" value={roleForm.roleType} onChange={e => setRoleForm({...roleForm, roleType: e.target.value})} options={[{ label: "Executive", value: "EXEC" }, { label: "Lead", value: "LEAD" }, { label: "Member", value: "MEMBER" }]} />
                <AdminInput label="Promotion level" required type="number" value={roleForm.level} onChange={e => setRoleForm({...roleForm, level: e.target.value})} />
                <AdminButton type="submit" icon={Plus}>Add position</AdminButton>
              </form>
            </AdminCard>
          </div>
        )}
      </div>
      {showForm && (
        <div className="fixed inset-0 z-100 overflow-y-auto overscroll-contain scrollbar-none bg-slate-950/55 p-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="mx-auto my-4 w-full max-w-3xl space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-2xl sm:my-6 sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{editId ? "Edit Team Member" : "Add Team Member"}</h3>
                <p className="mt-1 text-sm text-slate-500">Manage the member profile and current team assignment.</p>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close member editor"><X className="h-5 w-5" /></button>
            </div>
            {editId && members.find((member) => (member.memberId || member._id) === editId)?.photo?.url && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Current photo</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={members.find((member) => (member.memberId || member._id) === editId)?.photo?.url} alt={form.name || "Team member"} className="max-h-64 w-full rounded-md object-contain" />
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AdminInput label="Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <AdminInput label="Email" required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <AdminInput label="Institute" required value={form.iiit} onChange={e => setForm({...form, iiit: e.target.value})} />
              <AdminInput label="Term" required value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
              <AdminSelect label="Role Type" value={form.roleType} onChange={e => setForm({...form, roleType: e.target.value})} options={[{label:"Member",value:"MEMBER"},{label:"Lead",value:"LEAD"},{label:"Exec",value:"EXEC"}]} />
              <AdminInput label="Role Title" required value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
              <AdminInput label="Team / Committee" value={form.team} onChange={e => setForm({...form, team: e.target.value})} />
              <AdminInput label="LinkedIn URL" value={form.linkedin} onChange={e => setForm({...form, linkedin: e.target.value})} />
              <AdminInput label="Instagram URL" value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} />
              <AdminInput label="Twitter URL" value={form.twitter} onChange={e => setForm({...form, twitter: e.target.value})} />
              <AdminInput label="Company" value={form.currentCompany} onChange={e => setForm({...form, currentCompany: e.target.value})} />
              <AdminInput label="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              <div className="sm:col-span-2"><AdminTextarea label="About" value={form.aboutText} onChange={e => setForm({...form, aboutText: e.target.value})} rows={3} /></div>
              <div className="sm:col-span-2"><AdminTextarea label="Message" value={form.messageText} onChange={e => setForm({...form, messageText: e.target.value})} rows={3} /></div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{editId ? "Replace photo (optional)" : "Photo (required)"}</label>
                <input type="file" accept="image/*" required={!editId} onChange={e => setPhotoFile(e.target.files?.[0] || null)} className="w-full text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <AdminButton type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</AdminButton>
              <AdminButton type="submit">{editId ? "Save changes" : "Add member"}</AdminButton>
            </div>
          </form>
        </div>
      )}

      {reviewingRequest && (
        <div className="fixed inset-0 z-100 overflow-y-auto overscroll-contain bg-slate-950/55 p-4 backdrop-blur-sm">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void reviewRequest(reviewingRequest, "accept", requestForm);
            }}
            className="mx-auto my-4 w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-2xl sm:my-6 sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Review team request</h2>
                <p className="mt-1 text-sm text-slate-500">Review or edit the applicant's profile and requested tenure before accepting.</p>
              </div>
              <button type="button" onClick={() => setReviewingRequest(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close request review">
                <X className="h-5 w-5" />
              </button>
            </div>

            {reviewingRequest.photo?.url && (
              <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Submitted photo</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={reviewingRequest.photo.url} alt={requestForm.name} className="max-h-64 w-full rounded-md object-contain" />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminInput label="Name" required value={requestForm.name} onChange={(event) => setRequestForm((form) => ({ ...form, name: event.target.value }))} />
              <AdminInput label="Email" required type="email" value={requestForm.email} onChange={(event) => setRequestForm((form) => ({ ...form, email: event.target.value }))} />
              <AdminInput label="Institute" value={requestForm.iiit} onChange={(event) => setRequestForm((form) => ({ ...form, iiit: event.target.value }))} />
              <AdminInput label="Requested term" required value={requestForm.year} onChange={(event) => setRequestForm((form) => ({ ...form, year: event.target.value }))} placeholder="2026 or 2026-27" />
              <AdminInput label="Requested role" required value={requestForm.role} onChange={(event) => setRequestForm((form) => ({ ...form, role: event.target.value }))} />
              <AdminInput label="Team" required value={requestForm.team} onChange={(event) => setRequestForm((form) => ({ ...form, team: event.target.value }))} />
              <AdminInput label="LinkedIn" value={requestForm.linkedin || ""} onChange={(event) => setRequestForm((form) => ({ ...form, linkedin: event.target.value }))} />
              <AdminInput label="Instagram" value={requestForm.instagram || ""} onChange={(event) => setRequestForm((form) => ({ ...form, instagram: event.target.value }))} />
              <AdminInput label="Twitter" value={requestForm.twitter || ""} onChange={(event) => setRequestForm((form) => ({ ...form, twitter: event.target.value }))} />
              <div className="sm:col-span-2"><AdminTextarea label="About" rows={3} value={requestForm.aboutText || ""} onChange={(event) => setRequestForm((form) => ({ ...form, aboutText: event.target.value }))} /></div>
              <div className="sm:col-span-2"><AdminTextarea label="Message" rows={3} value={requestForm.messageText || ""} onChange={(event) => setRequestForm((form) => ({ ...form, messageText: event.target.value }))} /></div>
            </div>

            {reviewError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{reviewError}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <AdminButton type="button" variant="danger" icon={XCircle} disabled={reviewSaving} onClick={() => void reviewRequest(reviewingRequest, "reject")}>Decline request</AdminButton>
              <AdminButton type="button" variant="ghost" disabled={reviewSaving} onClick={() => setReviewingRequest(null)}>Cancel</AdminButton>
              <AdminButton type="submit" icon={UserCheck} isLoading={reviewSaving}>Accept request</AdminButton>
            </div>
          </form>
        </div>
      )}

      <AdminActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        action={modalAction}
        memberId={modalMemberId}
        hasActiveTenure={Boolean(members.find((member) => (member.memberId || member._id) === modalMemberId)?.isActive)}
        onSuccess={() => { setModalOpen(false); loadMembers(); setSuccess("Action completed."); }}
      />
    </AdminLayout>
  );
}
