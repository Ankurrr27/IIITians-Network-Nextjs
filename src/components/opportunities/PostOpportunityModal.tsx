"use client";

import React, { useState } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { isBlockedRecruiterEmail } from "@/data/iiitDomains";

interface PostOpportunityModalProps {
  open: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

type Step = "verify" | "form" | "success";

export default function PostOpportunityModal({ open, onClose, isDarkMode }: PostOpportunityModalProps) {
  const [step, setStep] = useState<Step>("verify");
  const [workEmail, setWorkEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [emailError, setEmailError] = useState("");

  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Internships");
  const [location, setLocation] = useState("");
  const [compensation, setCompensation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [applicationLink, setApplicationLink] = useState("");

  const resetAll = () => {
    setStep("verify");
    setWorkEmail("");
    setCompanyName("");
    setLinkedinUrl("");
    setEmailError("");
    setTitle("");
    setCategory("Internships");
    setLocation("");
    setCompensation("");
    setDeadline("");
    setDescription("");
    setSkills("");
    setApplicationLink("");
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlockedRecruiterEmail(workEmail)) {
      setEmailError(
        "Personal email domains (Gmail, Yahoo, Outlook, etc.) are not allowed. Please use your work email. Early-stage founders can request admin approval."
      );
      return;
    }
    setEmailError("");
    setStep("form");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("success");
  };

  if (!open) return null;

  const inputClass = `mt-1 w-full rounded-xl border p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
    isDarkMode
      ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500"
      : "bg-slate-50 border-slate-200 text-slate-950 placeholder-slate-400"
  }`;

  const labelClass = "block text-[10px] font-bold uppercase tracking-wider text-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl transition-colors duration-300 ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-950"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={18} />
        </button>

        {/* ── Step 1: Verify Recruiter ────────────────────────────────── */}
        {step === "verify" && (
          <>
            <h2 className="text-xl font-bold tracking-tight">Verify Your Identity</h2>
            <p className="mt-1 text-xs text-slate-400">
              Only verified recruiters can post opportunities. We verify your work email
              and company to prevent spam.
            </p>

            <form onSubmit={handleVerify} className="mt-6 space-y-4">
              <div>
                <label className={labelClass}>Work Email *</label>
                <input
                  type="email"
                  required
                  value={workEmail}
                  onChange={(e) => { setWorkEmail(e.target.value); setEmailError(""); }}
                  placeholder="you@company.com"
                  className={inputClass}
                />
                {emailError && (
                  <div className="mt-2 flex items-start gap-2 text-[11px] font-semibold text-red-500">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TechCorp India"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>LinkedIn Profile</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className={inputClass}
                />
              </div>

              <div
                className={`rounded-xl border px-3.5 py-3 text-[11px] font-semibold leading-5 ${
                  isDarkMode
                    ? "border-amber-900/40 bg-amber-950/30 text-amber-400"
                    : "border-amber-100 bg-amber-50 text-amber-700"
                }`}
              >
                <strong>Early-stage founders:</strong> If you don&apos;t have a company domain yet,
                submit with your personal email and request admin approval. Our team will verify
                your profile manually.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition active:scale-95 ${
                    isDarkMode
                      ? "border-slate-800 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95"
                >
                  Continue
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Step 2: Post Opportunity Form ───────────────────────────── */}
        {step === "form" && (
          <>
            <h2 className="text-xl font-bold tracking-tight">Post an Opportunity</h2>
            <p className="mt-1 text-xs text-slate-400">
              Posting as <span className="font-bold text-indigo-500">{workEmail}</span> from{" "}
              <span className="font-bold">{companyName}</span>
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className={labelClass}>Opportunity Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Frontend Engineering Intern"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputClass}
                  >
                    <option>Internships</option>
                    <option>Full-Time</option>
                    <option>Research</option>
                    <option>Open Source</option>
                    <option>Hackathons</option>
                    <option>Startups</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote / Pune"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Compensation</label>
                  <input
                    type="text"
                    value={compensation}
                    onChange={(e) => setCompensation(e.target.value)}
                    placeholder="e.g. ₹25,000/month"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Application Deadline</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="e.g. Jul 30, 2026"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Description & Requirements *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Skills Required (comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, Python"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Application Link / Email</label>
                <input
                  type="text"
                  value={applicationLink}
                  onChange={(e) => setApplicationLink(e.target.value)}
                  placeholder="https://careers.company.com or mailto:hr@company.com"
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("verify")}
                  className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition active:scale-95 ${
                    isDarkMode
                      ? "border-slate-800 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95"
                >
                  Submit for Review
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Step 3: Success ─────────────────────────────────────────── */}
        {step === "success" && (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-bold">Opportunity Submitted!</h3>
            <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto">
              Your listing has been submitted for review. Our team will verify your identity
              and publish the opportunity within 24-48 hours.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
