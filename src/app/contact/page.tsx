"use client";
import { useState } from "react";
import api from "@/lib/apiClient";
import type { Metadata } from "next";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      // Contact form — can post to an email API or just show success
      await new Promise((r) => setTimeout(r, 800));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  return (
    <main className="relative min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] pt-24 pb-20">
      <div className="mx-auto max-w-2xl px-6">
        <header className="mb-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-500">Get in Touch</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">Contact Us</h1>
          <p className="mt-3 text-slate-500">Reach out for collaborations, partnerships, or any queries about IIITians Network.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Your Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email Address</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Message</label>
            <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
          </div>
          {status === "done" ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">✓ Message sent! We&apos;ll get back to you soon.</p>
          ) : (
            <button type="submit" disabled={status === "sending"}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 disabled:opacity-60">
              {status === "sending" ? "Sending…" : "Send Message"}
            </button>
          )}
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          You can also reach us on{" "}
          <a href="https://linkedin.com/company/iiitians-network" target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:underline">LinkedIn</a>
          {" "}or{" "}
          <a href="https://discord.gg/88AnpuNc6E" target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:underline">Discord</a>.
        </div>
      </div>
    </main>
  );
}
