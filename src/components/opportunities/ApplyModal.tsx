"use client";

import React, { useState } from "react";
import { X, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { isIIITEmail } from "@/data/iiitDomains";
import type { Opportunity } from "@/data/opportunities";

interface ApplyModalProps {
  open: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  isDarkMode: boolean;
}

type Step = "verify" | "profile" | "confirm" | "success";

export default function ApplyModal({ open, opportunity, onClose, isDarkMode }: ApplyModalProps) {
  const [step, setStep] = useState<Step>("verify");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"none" | "student" | "alumni">("none");

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [institute, setInstitute] = useState("");
  const [batch, setBatch] = useState("");
  const [profileSkills, setProfileSkills] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");

  const resetAll = () => {
    setStep("verify");
    setEmail("");
    setEmailError("");
    setVerificationStatus("none");
    setFullName("");
    setInstitute("");
    setBatch("");
    setProfileSkills("");
    setResumeLink("");
    setLinkedin("");
    setGithub("");
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIIITEmail(email)) {
      setEmailError(
        "Please use your official IIIT email address (e.g. yourname@iiitranchi.ac.in). Only verified IIIT community members can apply through this platform."
      );
      return;
    }
    setEmailError("");
    // Determine status based on batch/pattern (simplified for Phase 1)
    setVerificationStatus("student");
    setStep("profile");
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("confirm");
  };

  const handleFinalSubmit = () => {
    setStep("success");
  };

  if (!open || !opportunity) return null;

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
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={18} />
        </button>

        {/* Opportunity reference */}
        <div
          className={`mb-4 rounded-xl border px-3.5 py-2.5 ${
            isDarkMode ? "border-slate-800 bg-slate-950/50" : "border-slate-100 bg-slate-50"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Applying for
          </p>
          <p className={`mt-1 text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            {opportunity.title}
          </p>
          <p className="text-[11px] text-slate-400 font-semibold">{opportunity.company}</p>
        </div>

        {/* ── Step 1: Verify IIIT Email ──────────────────────────────── */}
        {step === "verify" && (
          <>
            <h2 className="text-lg font-bold tracking-tight">Verify Your IIIT Identity</h2>
            <p className="mt-1 text-xs text-slate-400">
              Only verified IIIT community members can apply directly through the platform.
            </p>

            <form onSubmit={handleVerifyEmail} className="mt-5 space-y-4">
              <div>
                <label className={labelClass}>IIIT Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  placeholder="yourname@iiitranchi.ac.in"
                  className={inputClass}
                />
                {emailError && (
                  <div className="mt-2 flex items-start gap-2 text-[11px] font-semibold text-red-500">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              <div
                className={`rounded-xl border px-3.5 py-3 text-[11px] font-semibold leading-5 ${
                  isDarkMode
                    ? "border-indigo-900/40 bg-indigo-950/30 text-indigo-400"
                    : "border-indigo-100 bg-indigo-50 text-indigo-700"
                }`}
              >
                <strong>Why verify?</strong> Verification ensures only genuine IIIT students and
                alumni can apply, maintaining trust for recruiters and the community.
              </div>

              <div className="flex gap-3 pt-1">
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
                  Verify Email
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Step 2: Student Profile ────────────────────────────────── */}
        {step === "profile" && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold tracking-tight">Your Profile</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <ShieldCheck size={10} />
                {verificationStatus === "alumni" ? "Verified Alumni" : "Verified Student"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Complete your profile to apply. This information will be shared with the recruiter.
            </p>

            <form onSubmit={handleProfileSubmit} className="mt-5 space-y-3">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>IIIT *</label>
                  <input
                    type="text"
                    required
                    value={institute}
                    onChange={(e) => setInstitute(e.target.value)}
                    placeholder="e.g. IIIT Ranchi"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Batch *</label>
                  <input
                    type="text"
                    required
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="e.g. 2023-2027"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Skills (comma separated)</label>
                <input
                  type="text"
                  value={profileSkills}
                  onChange={(e) => setProfileSkills(e.target.value)}
                  placeholder="e.g. React, Python, Machine Learning"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Resume Link</label>
                <input
                  type="url"
                  value={resumeLink}
                  onChange={(e) => setResumeLink(e.target.value)}
                  placeholder="Google Drive / Notion link to your resume"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>LinkedIn</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>GitHub</label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="github.com/..."
                    className={inputClass}
                  />
                </div>
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
                  Review Application
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── Step 3: Confirm ────────────────────────────────────────── */}
        {step === "confirm" && (
          <>
            <h2 className="text-lg font-bold tracking-tight">Confirm Application</h2>
            <p className="mt-1 text-xs text-slate-400">
              Review your details before submitting.
            </p>

            <div className="mt-5 space-y-3">
              <div
                className={`rounded-xl border px-4 py-3 space-y-2 text-xs ${
                  isDarkMode ? "border-slate-800 bg-slate-950/50" : "border-slate-100 bg-slate-50"
                }`}
              >
                <p><span className="font-bold text-slate-400">Name:</span> <span className={isDarkMode ? "text-white" : "text-slate-800"}>{fullName}</span></p>
                <p><span className="font-bold text-slate-400">Email:</span> <span className={isDarkMode ? "text-white" : "text-slate-800"}>{email}</span></p>
                <p><span className="font-bold text-slate-400">IIIT:</span> <span className={isDarkMode ? "text-white" : "text-slate-800"}>{institute}</span></p>
                <p><span className="font-bold text-slate-400">Batch:</span> <span className={isDarkMode ? "text-white" : "text-slate-800"}>{batch}</span></p>
                {profileSkills && <p><span className="font-bold text-slate-400">Skills:</span> <span className={isDarkMode ? "text-white" : "text-slate-800"}>{profileSkills}</span></p>}
                {resumeLink && <p><span className="font-bold text-slate-400">Resume:</span> <span className="text-indigo-500 break-all">{resumeLink}</span></p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("profile")}
                  className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition active:scale-95 ${
                    isDarkMode
                      ? "border-slate-800 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Step 4: Success ────────────────────────────────────────── */}
        {step === "success" && (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h3 className="mt-4 text-lg font-bold">Application Submitted!</h3>
            <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto">
              Your application for <strong>{opportunity.title}</strong> at{" "}
              <strong>{opportunity.company}</strong> has been submitted. The recruiter
              will receive your profile details.
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
