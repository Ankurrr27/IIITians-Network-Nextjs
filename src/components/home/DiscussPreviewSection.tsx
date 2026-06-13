"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient";
import type { IDiscussPost } from "@/types";
import DiscussCard from "@/components/discuss/DiscussCard";

export default function DiscussPreviewSection() {
  const [posts, setPosts] = useState<IDiscussPost[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const LIMIT = 3;

  useEffect(() => {
    let mounted = true;
    api
      .get("/discuss")
      .then((res) => {
        if (!mounted) return;
        setPosts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("DISCUSS PREVIEW ERROR:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const approvedPosts = posts
    .filter((p) => p.status === "approved")
    .slice(0, LIMIT);

  return (
    <section className="bg-slate-50/50 py-8 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Latest from <span className="text-indigo-600">Discuss</span>
            </h2>
          </div>

          <button
            onClick={() => router.push("/discuss")}
            className="shrink-0 rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            View all posts
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: LIMIT }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : approvedPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-slate-500">No community posts available at the moment.</p>
          </div>
        ) : (
          <>
            {/* Mobile: community cards feed with gaps */}
            <div className="flex flex-col gap-4 sm:hidden">
              {approvedPosts.map((post) => (
                <DiscussCard key={post._id} post={post} />
              ))}
            </div>
            {/* Desktop: spaced list */}
            <div className="hidden space-y-6 sm:block">
              {approvedPosts.map((post) => (
                <DiscussCard key={post._id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
