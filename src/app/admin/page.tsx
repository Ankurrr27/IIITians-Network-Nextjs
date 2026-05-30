"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import api from "@/lib/apiClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessGranted = searchParams.get("gate") === "secure";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/admin/login", form);
      localStorage.setItem("adminToken", res.data.token);
      router.replace("/legacy/admin");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#0f172a_0%,_#1e1b4b_40%,_#0f172a_100%)]">
      <div className="w-full max-w-md px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
            {accessGranted ? (
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
            ) : (
              <LockKeyhole className="h-8 w-8 text-emerald-400" />
            )}
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {accessGranted ? "Admin Portal" : "Secure Gate Active"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {accessGranted
              ? "IIITians Network Internal Access"
              : "Authorized admins need the private secure access link before login."}
          </p>
        </div>

        {!accessGranted ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl shadow-slate-950/20">
            <p className="text-sm leading-7 text-slate-300">
              Login is hidden behind the secure admin gate. Use the private access URL shared with admins, or contact the Tech Lead if you lost it.
            </p>
            <a
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to site
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="admin@iiitiansnetwork.in"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 ring-1 ring-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-500 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-slate-600">
          Authorized personnel only ·{" "}
          <a href="/" className="text-slate-500 hover:text-white">
            Back to site
          </a>
        </p>
      </div>
    </main>
  );
}
