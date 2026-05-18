import React, { useEffect, useState } from "react";
import { Upload, X } from "lucide-react";
import api from "@/lib/apiClient";
import type { IEvent, ICollege } from "@/types";

export interface EventFormState {
  title: string;
  description: string;
  date: string;
  collegeName: string;
  clubName: string;
  link: string;
}

export const EMPTY_FORM: EventFormState = {
  title: "",
  description: "",
  date: "",
  collegeName: "",
  clubName: "",
  link: "",
};

interface AddEventFormProps {
  editingEvent: IEvent | null;
  onSuccess: (data: IEvent) => void;
  onCancel: () => void;
}

export default function AddEventForm({
  editingEvent,
  onSuccess,
  onCancel,
}: AddEventFormProps) {
  const [collegeOptions, setCollegeOptions] = useState<string[]>([]);
  const [form, setForm] = useState<EventFormState>(EMPTY_FORM);
  const [banner, setBanner] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setForm({
        title: editingEvent.title || "",
        description: editingEvent.description || "",
        date: editingEvent.date ? editingEvent.date.slice(0, 10) : "",
        collegeName: editingEvent.collegeName || "",
        clubName: editingEvent.clubName || "",
        link: editingEvent.link || "",
      });
      setPreview(editingEvent.banner?.url || "");
    }
  }, [editingEvent]);

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const response = await api.get<ICollege[]>("/colleges");
        setCollegeOptions(
          (response.data || []).map((c) => c?.name).filter(Boolean)
        );
      } catch {
        setCollegeOptions([]);
      }
    };
    loadColleges();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBanner(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (banner) {
      data.append("banner", banner);
    }

    try {
      const res = editingEvent
        ? await api.patch(`/events/${editingEvent._id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await api.post("/events", data, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      onSuccess(res.data);
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-50 border border-slate-200 rounded-[1.6rem] p-6 mb-8 space-y-6 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-lg font-extrabold text-slate-900">
          {editingEvent ? "Edit Event" : "Create Event"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm"
        >
          <X size={16} />
        </button>
      </div>

      {/* Basic Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
            Event Title
          </label>
          <input
            name="title"
            placeholder="e.g. E-Summit 2026"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
            Event Date
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
          Short Description
        </label>
        <textarea
          name="description"
          placeholder="e.g. Flagship entrepreneurship event with speaker sessions, startup showcase, and competitions."
          value={form.description}
          onChange={handleChange}
          rows={3}
          required
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-relaxed text-slate-700 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      {/* Meta Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
            College / Institute
          </label>
          <input
            name="collegeName"
            list="event-college-options"
            placeholder="Choose or type an IIIT, e.g. IIIT Kota"
            value={form.collegeName}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
          <datalist id="event-college-options">
            {collegeOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
            Club / Society
          </label>
          <input
            name="clubName"
            placeholder="e.g. E-Cell IIIT Nagpur"
            value={form.clubName}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Link */}
      <div className="space-y-2">
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
          Registration Link (Optional)
        </label>
        <input
          name="link"
          placeholder="e.g. https://forms.gle/esummit-registration"
          value={form.link}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      {/* Banner Upload */}
      <div className="space-y-3">
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
          Event Banner Image
        </label>

        {preview && (
          <div className="relative aspect-[16/9] w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Event Preview" className="h-full w-full object-cover" />
          </div>
        )}

        <label className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-slate-800">
          <Upload className="h-4 w-4" />
          {banner ? "Change Graphic Banner" : "Select Graphic Banner"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60 shadow-sm"
        >
          {loading ? "Saving Event..." : "Save Event Details"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
