"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Send,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  Linkedin,
  Instagram,
  UserPlus,
  Share2,
  Copy,
  AlertCircle
} from "lucide-react";
import api from "@/lib/apiClient";
import Link from "next/link";

const initialForm = {
  name: "",
  email: "",
  iiit: "",
  year: new Date().getFullYear().toString(),
  team: "Development",
  role: "",
  linkedin: "",
  instagram: "",
  twitter: "",
  aboutText: "",
  messageText: "",
};

const teamOptions = ["Development", "Design", "Content", "Social Media", "Core", "Tech"];

export default function TeamJoinPage() {
  const [collegeOptions, setCollegeOptions] = useState<string[]>([]);
  const [step, setStep] = useState(0); // 0: Selection, 1: Form
  const [applicantType, setApplicantType] = useState<"NEW" | "EXISTING">("NEW");
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectType = (type: "NEW" | "EXISTING") => {
    setApplicantType(type);
    setStep(1);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const response = await api.get("/colleges");
        const list = (response.data || []).map((c: any) => c.name).filter(Boolean);
        setCollegeOptions(list);
      } catch {
        setCollegeOptions([]);
      }
    };
    loadColleges();
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("applicantType", applicantType);
      if (photo) {
        formData.append("photo", photo);
      }

      // Try calling live backend endpoint first
      await api.post("/team-requests", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Fallback to LocalStorage requests queue
        let photoBase64 = null;
        if (photo) {
          try {
            photoBase64 = await fileToBase64(photo);
          } catch (e) {
            console.error("Failed to serialize file for mock storage:", e);
          }
        }

        const mockRequest = {
          ...form,
          _id: `mock_${Date.now()}`,
          applicantType,
          status: "pending",
          createdAt: new Date().toISOString(),
          hasPhoto: !!photo,
          photoBase64: photoBase64,
        };

        const existing = JSON.parse(localStorage.getItem("local-team-requests") || "[]");
        localStorage.setItem("local-team-requests", JSON.stringify([mockRequest, ...existing]));

        setSubmitted(true);
        if (typeof window !== "undefined") {
          window.scrollTo(0, 0);
        }
      } else {
        setError(err.response?.data?.message || "Failed to submit request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 0: Option Selection
  if (step === 0) {
    return (
      <main className="relative min-h-screen bg-[linear-gradient(180deg,_#f5f3ff_0%,_#f9fcff_50%)] flex items-center justify-center px-4 py-20">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.15),transparent_22%)]" />
        <div className="relative z-10 w-full max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] shadow-sm text-indigo-700">
            <Sparkles className="h-4 w-4" /> Join our mission
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Welcome to the Network
          </h1>
          <p className="max-w-md mx-auto text-base text-slate-500 font-semibold leading-relaxed">
            Apply to build India's premier IIIT community directory or update your current active tenure.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 pt-6">
            <button
              onClick={() => handleSelectType("NEW")}
              className="group relative flex flex-col items-center p-8 text-center bg-white border border-slate-200 hover:border-indigo-600 hover:shadow-xl rounded-[2rem] transition-all duration-300"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                <UserPlus className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">New Recruit</h3>
              <p className="mt-3 text-sm text-slate-500 font-semibold leading-relaxed">
                I want to join the IIITians Network team and publish my professional profile.
              </p>
              <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
                Apply Now <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </div>
            </button>

            <button
              onClick={() => handleSelectType("EXISTING")}
              className="group relative flex flex-col items-center p-8 text-center bg-white border border-slate-200 hover:border-indigo-600 hover:shadow-xl rounded-[2rem] transition-all duration-300"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Existing Member</h3>
              <p className="mt-3 text-sm text-slate-500 font-semibold leading-relaxed">
                I am already in the team and want to propose a new role or register an update.
              </p>
              <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
                Register Update <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#f0f9ff,_#f5f3ff)] px-6">
        <div className="mx-auto max-w-md text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-4xl">🎉</div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {applicantType === "NEW" ? "Application Submitted!" : "Update Registered!"}
          </h1>
          <p className="text-slate-500 font-semibold">
            {applicantType === "NEW"
              ? "Your request has been placed in the queue. The administrators will review it shortly."
              : "Your tenure detail update has been queued for verification."}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/team" className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Meet the Team
            </Link>
            <Link href="/" className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Go Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[linear-gradient(180deg,_#f5f3ff_0%,_#f9fcff_50%)] pb-20 pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.15),transparent_22%)]" />
      
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <header className="mb-10 text-center space-y-3">
          <div className="flex justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-700 ring-1 ring-indigo-50 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              {applicantType === "NEW" ? "New Application" : "Member Update"}
            </div>
            <button onClick={() => setStep(0)} className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-wider">
              Change Selection
            </button>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            {applicantType === "NEW" ? "Team Application" : "Tenure Update"}
          </h1>
          <p className="max-w-md mx-auto text-sm text-slate-500 font-semibold leading-relaxed">
            Fill in your details below. Fields marked with an asterisk (*) are required.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {error && (
              <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 font-semibold ring-1 ring-rose-100 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Priyanshu Sharma"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address *</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@iiit.ac.in"
                  className={inputCls}
                />
              </div>

              {applicantType === "NEW" && (
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">IIIT Institute *</label>
                  <select
                    required
                    name="iiit"
                    value={form.iiit}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    <option value="">Select your institute...</option>
                    {collegeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {applicantType === "NEW" ? "Target Tenure Year *" : "New Tenure Year *"}
                </label>
                <input
                  required
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  placeholder="e.g. 2026"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Team Preference *</label>
                <select
                  required
                  name="team"
                  value={form.team}
                  onChange={handleChange}
                  className={inputCls}
                >
                  {teamOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {applicantType === "NEW" ? "Proposed Role *" : "New Role / Position *"}
                </label>
                <input
                  required
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  placeholder="e.g. Graphic Designer, Web Developer..."
                  className={inputCls}
                />
              </div>
            </div>

            {applicantType === "NEW" && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Social Presence (New Profiles)</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">LinkedIn URL</label>
                    <input
                      name="linkedin"
                      value={form.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/..."
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Instagram URL</label>
                    <input
                      name="instagram"
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="https://instagram.com/..."
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Twitter URL</label>
                    <input
                      name="twitter"
                      value={form.twitter}
                      onChange={handleChange}
                      placeholder="https://x.com/..."
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">About / Professional Bio</label>
                  <textarea
                    name="aboutText"
                    value={form.aboutText}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Short summary of skills, current projects, etc."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Note for Admin (Private)</label>
              <textarea
                name="messageText"
                value={form.messageText}
                onChange={handleChange}
                rows={2}
                placeholder="Any special remarks or updates instructions..."
                className={`${inputCls} resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Submitting application..." : "Submit Registration →"}
            </button>
          </form>

          {/* Profile Photo selector sidebar */}
          <aside className="space-y-6">
            {applicantType === "NEW" && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center">
                <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">
                  Roster Photo
                </label>
                <div className="relative h-40 w-40 overflow-hidden rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={URL.createObjectURL(photo)} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center justify-center gap-1.5">
                      <Users className="h-10 w-10 animate-pulse" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Empty</span>
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => document.getElementById("photo-upload-join")?.click()}
                  className="w-full mt-5 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition"
                >
                  {photo ? "Change Photo" : "Upload File"}
                </button>
                <input
                  id="photo-upload-join"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPhoto(file);
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            <div className="rounded-3xl border border-indigo-50 bg-indigo-50/20 p-6 space-y-4">
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600">Review Checklist</h3>
              <ul className="space-y-4 text-xs font-semibold text-slate-600">
                <li className="flex gap-3">
                  <span className="text-indigo-300 font-black">01</span>
                  <p>Admins verify details and check credentials.</p>
                </li>
                <li className="flex gap-3">
                  <span className="text-indigo-300 font-black">02</span>
                  <p>Official update details are committed back to database.</p>
                </li>
                <li className="flex gap-3">
                  <span className="text-indigo-300 font-black">03</span>
                  <p>Your profile card is published on the network directories.</p>
                </li>
              </ul>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 bg-white px-4 py-2 rounded-xl shadow-sm transition"
              >
                <Share2 size={13} /> {copied ? "Copied!" : "Share Link"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition";
