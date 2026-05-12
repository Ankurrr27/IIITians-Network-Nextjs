"use client";
import { useState } from "react";
import api from "@/lib/apiClient";
import Link from "next/link";

const TEAMS = ["Core", "Tech", "Development", "Design", "Content", "Social Media"];
const IIITS = ["IIIT Allahabad", "IIIT Hyderabad", "IIIT Delhi", "IIIT Bangalore", "IIIT Pune", "IIIT Gwalior", "IIIT Kota", "IIIT Lucknow", "IIIT Nagpur", "IIIT Naya Raipur", "IIIT Una", "IIIT Vadodara", "IIIT Srirangam", "IIIT Dharwad", "IIIT Kancheepuram", "IIIT Sri City", "IIIT Raichur", "IIIT Kalyani", "IIIT Manipur", "IIIT Tiruchirappalli", "IIIT Sonepat", "IIIT Bhagalpur", "IIIT Bhopal", "IIIT Ranchi", "IIIT Agartala"];

interface Form {
  name: string; email: string; iiit: string; team: string;
  role: string; year: string; linkedin: string; instagram: string; twitter: string;
  aboutText: string; messageText: string;
}

const EMPTY: Form = { name: "", email: "", iiit: "", team: "Core", role: "", year: new Date().getFullYear().toString(), linkedin: "", instagram: "", twitter: "", aboutText: "", messageText: "" };

export default function TeamJoinPage() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: keyof Form, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append("photo", photoFile);
      // POST to team (the API will set isActive:false for pending review)
      await api.post("/team", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setStatus("success");
    } catch (err: unknown) {
      setErrorMsg((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Submission failed. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#f0f9ff,_#f5f3ff)] px-6">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-4xl">🎉</div>
          <h1 className="text-2xl font-extrabold text-slate-900">Application Submitted!</h1>
          <p className="mt-3 text-slate-500">Your application to join the IIITians Network team has been submitted. Our team will review it soon.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/team" className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">Meet the Team</Link>
            <Link href="/" className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Go Home</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[linear-gradient(180deg,_#f5f3ff_0%,_#f9fcff_50%)] pb-20 pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.15),transparent_22%)]" />
      <div className="relative z-10 mx-auto max-w-2xl px-6">
        <header className="mb-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-500">Join Us</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">Join the Team</h1>
          <p className="mt-3 text-slate-500">Apply to be part of the team building India's premier IIIT network.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {status === "error" && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMsg}</div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full Name *">
              <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="e.g. Priyanshu Sharma" />
            </Field>
            <Field label="Email Address *">
              <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="you@college.edu" />
            </Field>
            <Field label="IIIT *" className="sm:col-span-2">
              <select required value={form.iiit} onChange={(e) => set("iiit", e.target.value)} className={inputCls}>
                <option value="">Select your IIIT…</option>
                {IIITS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Year of Study *">
              <input required value={form.year} onChange={(e) => set("year", e.target.value)} className={inputCls} placeholder="e.g. 2024" />
            </Field>
            <Field label="Team Preference *">
              <select required value={form.team} onChange={(e) => set("team", e.target.value)} className={inputCls}>
                {TEAMS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Role / Position *" className="sm:col-span-2">
              <input required value={form.role} onChange={(e) => set("role", e.target.value)} className={inputCls} placeholder="e.g. Frontend Developer, Content Writer…" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="LinkedIn URL">
              <input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} className={inputCls} placeholder="https://linkedin.com/in/…" />
            </Field>
            <Field label="Instagram URL">
              <input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className={inputCls} placeholder="https://instagram.com/…" />
            </Field>
            <Field label="Twitter / X URL">
              <input value={form.twitter} onChange={(e) => set("twitter", e.target.value)} className={inputCls} placeholder="https://x.com/…" />
            </Field>
          </div>

          <Field label="About You">
            <textarea rows={3} value={form.aboutText} onChange={(e) => set("aboutText", e.target.value)} className={`${inputCls} resize-none`} placeholder="A short bio — your skills, interests, past experience…" />
          </Field>

          <Field label="Message to the Team">
            <textarea rows={3} value={form.messageText} onChange={(e) => set("messageText", e.target.value)} className={`${inputCls} resize-none`} placeholder="Why do you want to join? What will you bring?" />
          </Field>

          <Field label="Photo (optional)">
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-indigo-700" />
          </Field>

          <button type="submit" disabled={status === "submitting"}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 disabled:opacity-60">
            {status === "submitting" ? "Submitting…" : "Submit Application →"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition";
