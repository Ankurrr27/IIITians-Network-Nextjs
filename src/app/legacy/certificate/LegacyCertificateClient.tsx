"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Download,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
} from "lucide-react";
import api from "@/lib/apiClient";

type CertificateMember = {
  id: string;
  name: string;
  email: string;
  iiit: string;
  branch: string;
  generation: string;
  graduationYear: number;
  networkPost?: string;
  legacyType: "alumni" | "team_member";
  roleHistory?: Array<{ role: string; team: string; year: string }>;
  reviewedAt?: string;
  createdAt?: string;
};

const TOKEN_KEY = "legacyCertificateToken";

export default function LegacyCertificateClient() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [member, setMember] = useState<CertificateMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  const issuedDate = useMemo(() => {
    const date = member?.reviewedAt || member?.createdAt || new Date().toISOString();
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, [member]);

  const certificateId = useMemo(() => {
    if (!member) return "";
    return `IIN-LEGACY-${member.id.slice(-8).toUpperCase()}`;
  }, [member]);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY) || "";
    if (!savedToken) {
      setCheckingSession(false);
      return;
    }

    setToken(savedToken);
    loadCertificate(savedToken).finally(() => setCheckingSession(false));
  }, []);

  const loadCertificate = async (nextToken: string) => {
    try {
      const res = await api.get<{ member: CertificateMember }>("/legacy/certificate/me", {
        headers: { Authorization: `Bearer ${nextToken}` },
      });
      setMember(res.data.member);
      setError("");
    } catch (err: any) {
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setMember(null);
      setError(err.response?.data?.message || "Certificate session expired. Please log in again.");
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post<{ token: string }>("/legacy/certificate/login", { email });
      localStorage.setItem(TOKEN_KEY, res.data.token);
      setToken(res.data.token);
      await loadCertificate(res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not find a certificate for this email.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setMember(null);
    setEmail("");
    setError("");
  };

  const handleDownload = () => {
    window.print();
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef7ff] px-4 pt-24">
        <div className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          Checking certificate session...
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eef7ff_0%,#f8fbff_45%,#ffffff_100%)] px-4 pb-16 pt-24 text-slate-900 print:bg-white print:p-0">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_16%_15%,rgba(79,70,229,0.16),transparent_0_24%),radial-gradient(circle_at_84%_20%,rgba(14,165,233,0.14),transparent_0_22%),radial-gradient(circle_at_50%_85%,rgba(16,185,129,0.10),transparent_0_26%)] print:hidden" />

      <div className="relative z-10 mx-auto max-w-6xl print:max-w-none">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/legacy"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Legacy
          </Link>

          {member && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          )}
        </div>

        {!member ? (
          <section className="mx-auto max-w-xl rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(79,70,229,0.12)] backdrop-blur sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <Award className="h-8 w-8" />
            </div>

            <div className="mt-6 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-indigo-600">
                Legacy Certificate
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Get your certificate
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Enter the same email that is registered on your approved Network Legacy profile.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Registered Legacy Email
                </span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@email.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </label>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_36px_rgba(79,70,229,0.24)] transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {loading ? "Verifying..." : "Verify and open certificate"}
              </button>
            </form>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />
                  Verified Legacy profile
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Certificate for {member.name}
                </h1>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_36px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4" />
                Download / Print
              </button>
            </div>

            <div className="certificate-page mx-auto aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-indigo-100 bg-white p-8 shadow-[0_30px_90px_rgba(79,70,229,0.16)] print:aspect-auto print:min-h-screen print:max-w-none print:rounded-none print:border-0 print:p-12 print:shadow-none">
              <div className="flex h-full flex-col border-[10px] border-double border-indigo-100 p-8 text-center print:min-h-[calc(100vh-6rem)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white print:bg-indigo-600">
                  <Award className="h-9 w-9" />
                </div>

                <p className="mt-8 text-[12px] font-bold uppercase tracking-[0.35em] text-indigo-600">
                  IIITians Network
                </p>
                <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Certificate of Legacy
                </h2>

                <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-slate-600">
                  This certificate is proudly presented to
                </p>

                <div className="mx-auto mt-4 w-full max-w-3xl border-b-2 border-slate-300 pb-3">
                  <h3 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
                    {member.name}
                  </h3>
                </div>

                <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  for being a recognized part of the IIITians Network Legacy and contributing to the student-led community across the IIIT ecosystem.
                </p>

                <div className="mx-auto mt-8 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3">
                  <CertificateDetail label="Institute" value={member.iiit} />
                  <CertificateDetail label="Batch / Term" value={member.generation} />
                  <CertificateDetail label="Role" value={member.networkPost || member.legacyType.replace("_", " ")} />
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-10 text-left">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Certificate ID
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold text-slate-900">{certificateId}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Issued On
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{issuedDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="mb-2 h-px w-44 bg-slate-300" />
                    <p className="text-sm font-bold text-slate-900">IIITians Network</p>
                    <p className="text-xs font-semibold text-slate-500">Verified Legacy Record</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function CertificateDetail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold capitalize text-slate-900">{value || "Legacy Member"}</p>
    </div>
  );
}
