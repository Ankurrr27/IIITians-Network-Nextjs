"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Link2, Globe, Search, ChevronLeft, ChevronRight, Users, Building2, Briefcase, MapPin, Send } from "lucide-react";
import api from "@/lib/apiClient";
import type { IAlumni } from "@/types";
import { notifyPageEntry } from "@/utils/appNotifications";
import ImageCropModal from "@/components/ImageCropModal";

interface Props { initialAlumni: IAlumni[]; }

const PER_PAGE = 12;

function normalizeCollegeName(name: string) {
  const n = (name || "").trim().toLowerCase();
  if (n.includes("sricity") || n.includes("sri city") || n === "chittoor" || (n.includes("iiit") && n.includes("chittoor"))) return "iiit sricity_chittoor_canonical";
  return n;
}

export default function LegacyClient({ initialAlumni }: Props) {
  const [alumni, setAlumni] = useState(initialAlumni);
  const [search, setSearch] = useState("");
  const [generationFilter, setGenerationFilter] = useState("");
  const [iiitFilter, setIiitFilter] = useState("");
  const [professionalFilter, setProfessionalFilter] = useState("");
  const [legacyTypeFilter, setLegacyTypeFilter] = useState("");
  const [networkPostFilter, setNetworkPostFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [rawPhoto, setRawPhoto] = useState<File | null>(null);
  const [croppedPhoto, setCroppedPhoto] = useState<File | null>(null);
  const [form, setForm] = useState({ name: "", email: "", iiit: "", graduationYear: "", generation: "", branch: "", networkPost: "", currentRole: "", currentCompany: "", location: "", linkedin: "", instagram: "", bio: "" });

  useEffect(() => { notifyPageEntry("Network Legacy loaded", "Explore IIITians who shaped the network.", "page-legacy-loaded"); }, []);

  const generations = useMemo(() => Array.from(new Set(alumni.map(a => a.generation).filter(Boolean))).sort(), [alumni]);
  const iiiTs = useMemo(() => Array.from(new Set(alumni.map(a => a.iiit).filter(Boolean))).sort(), [alumni]);
  const networkPosts = useMemo(() => Array.from(new Set(alumni.map(a => a.networkPost).filter(Boolean))).sort(), [alumni]);

  const filtered = useMemo(() => {
    return alumni.filter(a => {
      if (legacyTypeFilter && a.legacyType !== legacyTypeFilter) return false;
      if (iiitFilter && normalizeCollegeName(a.iiit) !== normalizeCollegeName(iiitFilter)) return false;
      if (generationFilter && a.generation !== generationFilter) return false;
      if (networkPostFilter && a.networkPost !== networkPostFilter) return false;
      if (professionalFilter === "working" && !a.currentRole && !a.currentCompany) return false;
      if (professionalFilter === "open" && (a.currentRole || a.currentCompany)) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.iiit.toLowerCase().includes(q) || a.branch?.toLowerCase().includes(q) || a.currentRole?.toLowerCase().includes(q) || a.currentCompany?.toLowerCase().includes(q) || a.networkPost?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [alumni, search, generationFilter, iiitFilter, professionalFilter, legacyTypeFilter, networkPostFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => { setPage(1); }, [search, generationFilter, iiitFilter, professionalFilter, legacyTypeFilter, networkPostFilter]);

  const stats = useMemo(() => {
    const companies = new Set(alumni.map(a => a.currentCompany).filter(Boolean));
    const batches = new Set(alumni.map(a => a.generation).filter(Boolean));
    return { total: alumni.length, companies: companies.size, batches: batches.size, posts: networkPosts.length };
  }, [alumni, networkPosts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true); setFormError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (croppedPhoto) fd.append("photo", croppedPhoto);
      await api.post("/alumni", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setFormSuccess(true);
      const res = await api.get("/alumni");
      if (Array.isArray(res.data)) setAlumni(res.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setFormError(axiosErr.response?.data?.message || "Submission failed.");
    } finally { setFormLoading(false); }
  };

  const selectCls = "rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:ring-2 focus:ring-emerald-400 outline-none";

  return (
    <main className="relative min-h-screen bg-[linear-gradient(180deg,_#f0fdf4_0%,_#f9fcff_60%,_#f9fcff_100%)] pb-20 pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_15%_10%,rgba(52,211,153,0.12),transparent_22%),radial-gradient(circle_at_85%_80%,rgba(99,102,241,0.10),transparent_22%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Hero */}
        <header className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-600">Network Legacy</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Those Who <span className="text-emerald-600">Built the Network</span></h1>
          <p className="mt-3 text-base text-slate-500">{stats.total} profiles · Alumni, team members, and student leaders.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Users} label="Total Profiles" value={stats.total} />
            <StatCard icon={MapPin} label="Network Posts" value={stats.posts} />
            <StatCard icon={Briefcase} label="Companies" value={stats.companies} />
            <StatCard icon={Building2} label="Batches" value={stats.batches} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => { setShowForm(true); setFormSuccess(false); setFormError(""); }} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700">Add Your Profile →</button>
            <Link href="/admin/legacy" className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Admin</Link>
          </div>
        </header>

        {/* 6 Filters */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search name, college, role…" value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-9 pr-4 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <select value={generationFilter} onChange={e => setGenerationFilter(e.target.value)} className={selectCls}>
            <option value="">All Generations</option>
            {generations.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={iiitFilter} onChange={e => setIiitFilter(e.target.value)} className={selectCls}>
            <option value="">All IIITs</option>
            {iiiTs.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={professionalFilter} onChange={e => setProfessionalFilter(e.target.value)} className={selectCls}>
            <option value="">Professional Status</option>
            <option value="working">Currently Working</option>
            <option value="open">Open / Unspecified</option>
          </select>
          <select value={legacyTypeFilter} onChange={e => setLegacyTypeFilter(e.target.value)} className={selectCls}>
            <option value="">All Types</option>
            <option value="alumni">Alumni</option>
            <option value="team_member">Team Members</option>
          </select>
          <select value={networkPostFilter} onChange={e => setNetworkPostFilter(e.target.value)} className={selectCls}>
            <option value="">All Network Posts</option>
            {networkPosts.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</p>
          {totalPages > 1 && <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>}
        </div>

        {/* Profile Cards */}
        {paginated.length === 0 ? (
          <p className="py-20 text-center text-slate-400">No profiles found.</p>
        ) : (
          <div className="space-y-5">
            {paginated.map(person => (
              <article key={person._id} className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg overflow-hidden">
                <div className="grid gap-0 sm:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr] p-0">
                  {/* Image Section */}
                  <div className="relative h-64 sm:h-auto overflow-hidden bg-slate-100">
                    {person.photo?.url ? (
                      <Image 
                        src={person.photo.url} 
                        alt={person.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition duration-300" 
                        sizes="(max-width: 768px) 100vw, 340px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500">
                        <span className="text-7xl font-bold text-white opacity-30">{person.name[0]}</span>
                      </div>
                    )}
                    {/* Year Badge */}
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white bg-white/95 backdrop-blur px-3 py-1.5 shadow-sm">
                      <span className="text-xs font-bold text-slate-900">{person.graduationYear}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-col p-6 sm:p-8 lg:p-10">
                    {/* Header */}
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex-1">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{person.name}</h2>
                        {(person.currentRole || person.currentCompany) && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-100">
                            <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-sm font-semibold text-emerald-700">
                              {person.currentRole}{person.currentCompany ? ` @ ${person.currentCompany}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* College Info */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">IIIT</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{person.iiit}</p>
                        <p className="mt-1 text-xs text-slate-600">{person.branch}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    {person.bio && (
                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        {person.bio}
                      </p>
                    )}

                    {/* Network Journey */}
                    {person.networkPost && (
                      <div className="mt-6 border-t border-slate-200 pt-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Network Journey</p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 border border-slate-200">
                          <span className="text-xs font-semibold text-slate-500">{person.graduationYear}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-semibold text-slate-700">{person.networkPost}</span>
                          {person.generation && (
                            <>
                              <span className="text-xs text-slate-400">·</span>
                              <span className="text-xs text-slate-600">({person.generation})</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="mt-6 flex items-center gap-4">
                      {person.linkedin && (
                        <a href={person.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" title="LinkedIn">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                          LinkedIn
                        </a>
                      )}
                      {person.instagram && (
                        <a href={person.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" title="Instagram">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.69.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/></svg>
                          Instagram
                        </a>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${person.legacyType === "team_member" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                        {person.legacyType === "team_member" ? "Team Member" : "Alumni"}
                      </span>
                      {person.generation && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border border-slate-200">
                          {person.generation}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button>
            <span className="text-sm text-slate-500">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button>
          </div>
        )}

        {/* Submission Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
              {formSuccess ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✅</div>
                  <h2 className="text-xl font-bold text-slate-900">Profile Submitted!</h2>
                  <p className="mt-2 text-sm text-slate-500">Your profile is pending admin approval.</p>
                  <button onClick={() => setShowForm(false)} className="mt-6 rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Close</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div><h2 className="text-lg font-bold text-slate-900">Add Your Profile</h2><p className="text-sm text-slate-500">Submit your details for the Network Legacy.</p></div>
                  {formError && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <LegacyInput label="Full Name *" name="name" value={form.name} onChange={handleChange} required />
                    <LegacyInput label="Email *" name="email" type="email" value={form.email} onChange={handleChange} required />
                    <LegacyInput label="IIIT *" name="iiit" value={form.iiit} onChange={handleChange} placeholder="e.g. IIIT Kota" required />
                    <LegacyInput label="Graduation Year *" name="graduationYear" type="number" value={form.graduationYear} onChange={handleChange} placeholder="e.g. 2025" required />
                    <LegacyInput label="Batch / Generation *" name="generation" value={form.generation} onChange={handleChange} placeholder="e.g. Gen 3" required />
                    <LegacyInput label="Branch *" name="branch" value={form.branch} onChange={handleChange} placeholder="e.g. CSE" required />
                    <LegacyInput label="Network Post" name="networkPost" value={form.networkPost} onChange={handleChange} placeholder="e.g. Core Volunteer" />
                    <LegacyInput label="Current Role" name="currentRole" value={form.currentRole} onChange={handleChange} placeholder="e.g. SDE" />
                    <LegacyInput label="Company" name="currentCompany" value={form.currentCompany} onChange={handleChange} placeholder="e.g. Google" />
                    <LegacyInput label="Location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangalore" />
                    <LegacyInput label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/…" />
                    <LegacyInput label="Instagram" name="instagram" value={form.instagram} onChange={handleChange} placeholder="https://instagram.com/…" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Short Bio</label>
                    <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} maxLength={500} placeholder="A brief bio about your journey…" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      {croppedPhoto && <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-emerald-100"><img src={URL.createObjectURL(croppedPhoto)} alt="Preview" className="h-full w-full object-cover" /></div>}
                      <button type="button" onClick={() => document.getElementById("legacy-photo-input")?.click()} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">{croppedPhoto ? "Change Photo" : "Upload Photo"}</button>
                      <input id="legacy-photo-input" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setRawPhoto(f); e.target.value = ""; }} />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400">If you have a team photo on file, it can be reused automatically.</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={formLoading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 disabled:opacity-60"><Send className="h-4 w-4" />{formLoading ? "Submitting…" : "Submit Profile"}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {rawPhoto && <ImageCropModal file={rawPhoto} onClose={() => setRawPhoto(null)} onCrop={f => { setCroppedPhoto(f); setRawPhoto(null); }} />}
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white/80 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-emerald-600"><Icon className="h-4 w-4" /><span className="text-lg font-bold text-slate-900">{value}</span></div>
      <p className="mt-1 text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function LegacyInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      <input {...props} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-400 transition" />
    </div>
  );
}
