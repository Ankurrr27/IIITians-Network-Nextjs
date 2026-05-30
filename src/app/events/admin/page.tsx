"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { IEvent } from "@/types";
import EventCard from "@/components/events/EventCard";

// Import modular form component
import AddEventForm from "@/components/events/AddEventForm";

export default function EventsAdminPage() {
  const router = useRouter();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/events", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: search,
          sortBy: sortBy,
        },
      });
      if (res.data && Array.isArray(res.data)) {
        setEvents(res.data);
        setPagination({ totalPages: Math.ceil(res.data.length / itemsPerPage) || 1 });
      } else if (res.data) {
        setEvents(res.data.events || []);
        setPagination(res.data.pagination || { totalPages: 1 });
      }
    } catch (err) {
      console.error("Could not load events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentPage, search, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  const handleSuccess = () => {
    setEditingEvent(null);
    setShowForm(false);
    loadEvents();
  };

  const handleEdit = (event: IEvent) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event permanently?")) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setEditingEvent(null);
      setShowForm(false);
      loadEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Failed to delete event.");
    }
  };

  const totalPages = pagination.totalPages || 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Block */}
        <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-indigo-100 bg-white/80 text-indigo-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-indigo-700 hover:shadow-md active:scale-95"
                >
                  <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
                </button>
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-700">
                  <Calendar className="h-4 w-4" />
                  Events Workspace
                </div>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Event Management
              </h1>
              <p className="mt-2 text-sm text-slate-600 font-semibold leading-relaxed">
                Add, configure, and coordinate community events, hackathons, and webinars across campuses.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingEvent(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" /> Add Campus Event
            </button>
          </div>
        </section>

        {/* Filters */}
        <section className="flex flex-col gap-3 rounded-[1.15rem] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title, description, or college name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none font-semibold text-slate-700 focus:bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </section>

        {/* Inline Edit/Add Form */}
        {showForm && (
          <AddEventForm
            editingEvent={editingEvent}
            onSuccess={handleSuccess}
            onCancel={() => {
              setEditingEvent(null);
              setShowForm(false);
            }}
          />
        )}

        {/* Loading Spinner / Grid View */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            {events.length === 0 && (
              <p className="col-span-3 py-10 text-center text-sm font-semibold text-slate-400">
                No events found matching your current query.
              </p>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 shadow-sm"
            >
              Previous
            </button>
            <div className="text-xs font-bold text-slate-500">
              Page <span className="text-indigo-600 font-extrabold">{currentPage}</span> of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 shadow-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
