"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Clock,
  RefreshCcw,
  ShieldAlert,
  Activity,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";

interface LogEntry {
  _id: string;
  createdAt: string;
  adminEmail: string;
  action: string;
  targetResource: string;
  details?: string;
}

interface PaginationData {
  pages: number;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: LogEntry[]; pagination?: PaginationData }>("/admin-logs", {
        params: { search, page, limit: 15 },
      });
      setLogs(res.data?.data || []);
      setTotalPages(res.data?.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, 400); // Wait for user to stop typing
    return () => clearTimeout(delayDebounceFn);
  }, [fetchLogs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  const getQuickLink = (resource?: string) => {
    const normalized = resource?.toLowerCase();
    if (normalized === "alumni" || normalized === "legacy") return "/legacy/admin";
    if (normalized === "event") return "/events/admin";
    if (normalized === "team") return "/team/admin";
    if (normalized === "college") return "/colleges/admin";
    if (normalized === "discuss") return "/discuss/admin";
    if (normalized === "placement") return "/placement/admin";
    return null;
  };

  return (
    <AdminLayout>
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Activity Logs</h1>
          <p className="text-sm text-slate-500">Track all administrative actions, approvals, and system changes.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search details or admin..."
              value={search}
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:w-64"
            />
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex h-[38px] flex-shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin text-indigo-500" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Admin</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Details & Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="inline-flex items-center justify-center w-full gap-2">
                      <Activity size={16} className="animate-pulse" />
                      Fetching activity logs...
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <ShieldAlert size={24} className="mx-auto mb-2 opacity-50" />
                    No matching activity found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const link = getQuickLink(log.targetResource);
                  return (
                    <tr key={log._id} className="transition-colors hover:bg-slate-50/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-slate-700">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                        {log.adminEmail}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                            {log.action}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{log.targetResource}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-600 line-clamp-2" title={log.details}>
                            {log.details || "System action logged."}
                          </span>
                          {link && (
                            <Link
                              href={link}
                              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 hover:border-indigo-200"
                              title={`Go to ${log.targetResource} Management`}
                            >
                              View
                              <ExternalLink size={12} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
            <span className="text-sm text-slate-500">
              Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}
