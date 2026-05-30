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
  Twitter,
  UserPlus,
} from "lucide-react";
import api from "@/lib/apiClient";
import Link from "next/link";
import ImageCropModal from "@/components/ImageCropModal";

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

const teamOptions = ["Development", "Design", "Content", "Social Media"];

export default function TeamJoinPage() {
  const [collegeOptions, setCollegeOptions] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [applicantType, setApplicantType] = useState("NEW");
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [rawPhoto, setRawPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectType = (type: string) => {
    setApplicantType(type);
    setStep(1);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const response = await api.get("/colleges");
        setCollegeOptions(
          (response.data || []).map((c: { name?: string }) => c?.name).filter(Boolean)
        );
      } catch {
        setCollegeOptions([]);
      }
    };
    loadColleges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("applicantType", applicantType);
      if (photo) formData.append("photo", photo);

      await api.post("/team-requests", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS screen
  if (submitted) {
    return (
      <div className="relative min-h-screen bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)] pt-24 sm:pt-32">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm ring-1 ring-emerald-200">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {applicantType === "NEW" ? "Application Received!" : "Update Submitted!"}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            {applicantType === "NEW"
              ? "Thank you for applying. Your profile is currently in the review queue."
              : "Your tenure update has been sent to the administrators for verification."}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/team" className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700 sm:w-auto">
              Back to Team <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-8 py-4 text-sm font-semibold transition sm:w-auto">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STEP 0: TYPE SELECTION
  if (step === 0) {
    return (
      <div className="relative min-h-screen bg-[linear-gradient(180deg,_#eff6ff_0%,_#f9faff_40%,_#ffffff_100%)] flex flex-col items-center justify-center px-4 pb-20 pt-20 sm:pt-24">
        <div className="w-full max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] shadow-sm text-indigo-700 mb-6">
            <Sparkles className="h-4 w-4" /> Join the team
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl mb-4">
            Welcome to the Network
          </h1>
          <p className="text-lg text-slate-600 mb-12">
            Are you applying for the first time or updating your existing role?
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <SelectionCard
              title="New Recruit"
              desc="I want to join the IIITians Network team and build my professional profile."
              icon={UserPlus}
              onClick={() => handleSelectType("NEW")}
            />
            <SelectionCard
              title="Existing Member"
              desc="I am already in the team and want to update my tenure or proposed new role."
              icon={ShieldCheck}
              onClick={() => handleSelectType("EXISTING")}
            />
          </div>
        </div>
      </div>
    );
  }

  // STEP 1: FORM
  return (
    <div className="relative min-h-screen bg-[linear-gradient(180deg,_#eff6ff_0%,_#f9faff_40%,_#ffffff_100%)] pb-20 pt-20 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.14),transparent_0_20%)]" />

      <section className="relative z-10 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <div className="inline-flex items-center gap-2 rounded-full border bg-white text-indigo-700 border-indigo-100 shadow-sm px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em]">
                <ShieldCheck className="h-4 w-4" />
                {applicantType === "NEW" ? "New Application" : "Member Update"}
              </div>
              <button onClick={() => setStep(0)} className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:underline">
                Change Type
              </button>
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {applicantType === "NEW" ? "Team Application" : "Tenure Update"}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              {applicantType === "NEW"
                ? "Help build the future of the IIIT network. Submit your profile below for review."
                : "Submit your new role or tenure details for the upcoming session."}
            </p>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_340px]">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 p-4 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <InputGroup label="Full Name" icon={Sparkles} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Priyanshu Sharma" required />
                <InputGroup label="Email Address" icon={Mail} name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@iiit.ac.in" required />

                {applicantType === "NEW" && (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="iiit" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      IIIT Institute<span className="ml-[2px] text-indigo-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="iiit"
                        name="iiit"
                        list="team-join-colleges"
                        value={form.iiit}
                        onChange={handleChange}
                        placeholder="Choose or type your IIIT, e.g. IIIT Kota"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 sm:text-base placeholder:text-slate-300"
                      />
                      <datalist id="team-join-colleges">
                        {collegeOptions.map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                )}

                <InputGroup label={applicantType === "NEW" ? "Target Tenure" : "New Tenure"} icon={ShieldCheck} name="year" value={form.year} onChange={handleChange} placeholder="e.g. 2025-26" required />

                <div className="flex flex-col gap-2">
                  <label htmlFor="team" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Team Preference</label>
                  <select id="team" name="team" value={form.team} onChange={handleChange}
                    className="h-[52px] rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 px-4 text-sm outline-none transition focus:ring-4 focus:ring-indigo-500/10">
                    {teamOptions.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>

                <InputGroup label={applicantType === "NEW" ? "Proposed Role" : "New Role"} icon={Users} name="role" value={form.role} onChange={handleChange} placeholder="e.g. Core Volunteer" required />

                {applicantType === "NEW" && (
                  <>
                    <div className="sm:col-span-2">
                      <InputGroup label="LinkedIn Profile" icon={Linkedin} name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
                    </div>
                    <div className="sm:col-span-2">
                      <InputGroup label="Instagram (Optional)" icon={Instagram} name="instagram" value={form.instagram} onChange={handleChange} placeholder="https://instagram.com/username" />
                    </div>
                    <div className="sm:col-span-2">
                      <InputGroup label="Twitter (Optional)" icon={Twitter} name="twitter" value={form.twitter} onChange={handleChange} placeholder="https://twitter.com/username" />
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label htmlFor="aboutText" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Your Bio / Contributions</label>
                      <textarea id="aboutText" name="aboutText" value={form.aboutText} onChange={handleChange} rows={4} placeholder="Tell us about yourself and your skills."
                        className="rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-500/10" />
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="messageText" className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Note for Admin (Private)</label>
                  <textarea id="messageText" name="messageText" value={form.messageText} onChange={handleChange} rows={2} placeholder="Any specific note for update or application?"
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-500/10" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700 disabled:opacity-60">
                {loading ? "Processing..." : "Send Request"}
                {!loading && <Send className="h-4 w-4" />}
              </button>
            </form>

            <aside className="space-y-8">
              {applicantType === "NEW" && (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <label className="mb-6 block text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center lg:text-left">Profile Photo</label>
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative h-44 w-44 overflow-hidden rounded-[2.5rem] bg-slate-50 ring-4 ring-offset-4 ring-offset-white ring-slate-50">
                      {photo ? (
                        <img src={URL.createObjectURL(photo)} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-slate-200 text-slate-300">
                          <Users className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <button type="button"
                      onClick={() => document.getElementById("photo-upload")?.click()}
                      className="w-full rounded-xl bg-slate-950 text-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition">
                      {photo ? "Change Photo" : "Upload Photo"}
                    </button>
                    <input id="photo-upload" type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setRawPhoto(file);
                        e.target.value = "";
                      }} />
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-indigo-50 bg-indigo-50/30 p-8">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 mb-6">Process steps</h3>
                <ul className="space-y-6">
                  <StepItem num="01" text="Submit details for verification." />
                  <StepItem num="02" text="Admin reviews the request." />
                  <StepItem num="03" text="Verified profile goes live." />
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {rawPhoto && (
        <ImageCropModal
          file={rawPhoto}
          onClose={() => setRawPhoto(null)}
          onCrop={(croppedFile) => {
            setPhoto(croppedFile);
            setRawPhoto(null);
          }}
        />
      )}
    </div>
  );
}

function SelectionCard({ title, desc, icon: Icon, onClick }: { title: string; desc: string; icon: typeof UserPlus; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="group relative flex flex-col items-center p-8 text-center transition-all bg-white border-slate-200 hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/10 rounded-[2.5rem] border-2">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{desc}</p>
      <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
        Apply Now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}

function StepItem({ num, text }: { num: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="text-xs font-black italic tracking-tighter text-indigo-200">{num}</span>
      <p className="text-sm font-medium leading-relaxed text-slate-600">{text}</p>
    </li>
  );
}

function InputGroup({ label, icon: Icon, required, ...props }: {
  label: string; icon: typeof Sparkles; required?: boolean;
  name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={props.name} className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {label}
        {required && <span className="ml-[2px] text-indigo-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={props.name}
          {...props}
          required={required}
          className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 sm:text-base placeholder:text-slate-300"
        />
      </div>
    </div>
  );
}
