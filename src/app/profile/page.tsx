"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Clock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserCircle,
  UserPlus,
} from "lucide-react";
import api from "@/lib/apiClient";
import type { IDiscussAccount, IDiscussPost } from "@/types";

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="ui-card px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const [account, setAccount] = useState<IDiscussAccount | null>(null);
  const [posts, setPosts] = useState<IDiscussPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("discussToken");
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([
      api.get("/discuss-accounts/me", { headers: { Authorization: `Bearer ${token}` } }),
      api.get("/discuss/mine", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
    ])
      .then(([accountResponse, postsResponse]) => {
        setAccount(accountResponse.data);
        setPosts(postsResponse.data || []);
      })
      .catch(() => {
        localStorage.removeItem("discussToken");
        setAccount(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem("discussToken");
    setAccount(null);
    setPosts([]);
  };

  const approvedPosts = posts.filter((post) => post.status === "approved").length;
  const pendingPosts = posts.filter((post) => post.status === "pending").length;

  if (loading) {
    return (
      <main className="ui-page-bg min-h-screen pt-16 sm:pt-20">
        <div className="ui-page-shell py-8">
          <div className="ui-card h-48 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!account) {
    return (
      <main className="ui-page-bg min-h-screen pt-16 text-slate-950 sm:pt-20">
        <section className="ui-page-shell py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserCircle className="h-8 w-8" />
          </div>
          <h1 className="ui-title mt-5">Your <span className="ui-title-accent">Profile</span></h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Login or create a Discuss account to view your profile, verification status, and your club posts.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/discuss?account=true&mode=login" className="ui-button inline-flex items-center gap-2 bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
            <Link href="/discuss?account=true&mode=register&type=member" className="ui-button ui-button-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-bold">
              <UserPlus className="h-4 w-4" />
              Register
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const isMember = account.role === "club_member";
  const title = isMember ? account.contactName : account.clubName;

  return (
    <main className="ui-page-bg min-h-screen pt-16 text-slate-950 sm:pt-20">
      <section className="ui-page-shell py-6 sm:py-8">
        <div className="ui-panel p-4 sm:p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl font-black uppercase text-white">
                {title.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Profile</p>
                <h1 className="mt-1 truncate text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
                  <MapPin className="h-4 w-4" />
                  {account.collegeName}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`ui-chip ${isMember ? "border-indigo-100 bg-indigo-50 text-indigo-700" : account.isAuthorized ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-amber-100 bg-amber-50 text-amber-700"}`}>
                {isMember ? <MessageCircle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                {isMember ? "Member" : account.isAuthorized ? account.badgeLabel || "Verified club" : "Pending verification"}
              </span>
              <button onClick={logout} className="ui-button ui-button-ghost inline-flex min-h-9 items-center gap-2 px-3 text-xs">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoTile label="Handle" value={account.email.replace("@iiitiansnetwork", "")} />
            <InfoTile label="Role" value={account.role.replace("_", " ")} />
            <InfoTile label="Approved posts" value={String(approvedPosts)} />
            <InfoTile label="Pending posts" value={String(pendingPosts)} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_20rem]">
          <section className="ui-panel p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <MessageCircle className="h-5 w-5 text-indigo-600" />
              Discuss activity
            </h2>
            <div className="mt-4 space-y-3">
              {posts.length > 0 ? posts.slice(0, 5).map((post) => (
                <div key={post._id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${post.status === "approved" ? "bg-emerald-50 text-emerald-700" : post.status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
                      {post.status}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{post.type}</span>
                  </div>
                  <p className="mt-2 font-bold text-slate-950">{post.title}</p>
                </div>
              )) : (
                <p className="ui-empty px-4 py-8 text-sm font-semibold">
                  No official club posts yet.
                </p>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="ui-panel p-4 sm:p-5">
              <h2 className="text-lg font-black">Account details</h2>
              <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-indigo-600" /> {account.email}</p>
                <p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-indigo-600" /> {account.clubName}</p>
                {account.lastLogin && <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-indigo-600" /> {new Date(account.lastLogin).toLocaleString()}</p>}
              </div>
            </div>

            {!isMember && (
              <div className="ui-panel p-4 sm:p-5">
                <h2 className="flex items-center gap-2 text-lg font-black"><BadgeCheck className="h-5 w-5 text-indigo-600" /> Club status</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Verified club managers and publishers can create official announcements from the Discuss page.
                </p>
                <Link href="/discuss" className="ui-button ui-button-primary mt-4 inline-flex w-full items-center justify-center px-4 py-3 text-sm font-bold">
                  Open Discuss
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
