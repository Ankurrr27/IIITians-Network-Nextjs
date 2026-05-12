"use client";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/apiClient";
import AdminLayout from "@/components/AdminLayout";
import type { ICollege, IPlacement } from "@/types";
import { Building2, LoaderCircle, Plus, Trash2 } from "lucide-react";

const EMPTY_ROW = () => ({
  branch: "", highestPackage: "", averagePackage: "",
  lowestPackage: "", placementPercentage: "", studentsPlaced: "", totalStudents: "",
});

type PlacementRow = ReturnType<typeof EMPTY_ROW>;

export default function PlacementAdminPage() {
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [selectedCollegeId, setSelectedCollegeId] = useState("");
  const [loadingPlacement, setLoadingPlacement] = useState(false);
  const [placementId, setPlacementId] = useState<string | null>(null);
  const [fullData, setFullData] = useState<IPlacement | null>(null);
  const [existingYears, setExistingYears] = useState<number[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState<PlacementRow[]>([EMPTY_ROW()]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    api.get("/colleges").then((r) => setColleges([...r.data].sort((a: ICollege, b: ICollege) => a.name.localeCompare(b.name)))).finally(() => setLoadingColleges(false));
  }, []);

  useEffect(() => {
    if (!selectedCollegeId) { setPlacementId(null); setExistingYears([]); setRows([EMPTY_ROW()]); setFullData(null); return; }
    setLoadingPlacement(true);
    api.get(`/placements/college/${selectedCollegeId}`)
      .then((r) => { setPlacementId(r.data._id); setFullData(r.data); setExistingYears((r.data.yearlyPlacements || []).map((e: { year: number }) => e.year)); })
      .catch((err: { response?: { status?: number } }) => { if (err.response?.status !== 404) console.error(err); })
      .finally(() => setLoadingPlacement(false));
  }, [selectedCollegeId]);

  useEffect(() => {
    if (!fullData) { setRows([EMPTY_ROW()]); return; }
    const entry = (fullData.yearlyPlacements || []).find((p) => Number(p.year) === Number(year));
    if (entry?.placements?.length) {
      setRows(entry.placements.map((p) => ({
        branch: p.branch, highestPackage: String(p.highestPackage), averagePackage: String(p.averagePackage),
        lowestPackage: String(p.lowestPackage), placementPercentage: String(p.placementPercentage),
        studentsPlaced: String(p.studentsPlaced), totalStudents: String(p.totalStudents),
      })));
    } else { setRows([EMPTY_ROW()]); }
  }, [year, fullData]);

  const selectedCollege = useMemo(() => colleges.find((c) => c._id === selectedCollegeId), [colleges, selectedCollegeId]);

  const initRecord = async () => {
    setSaving(true); setMsg({ type: "", text: "" });
    try {
      const r = await api.post("/placements", { college: selectedCollegeId });
      setPlacementId(r.data._id);
      setMsg({ type: "success", text: "Placement record initialized." });
    } catch { setMsg({ type: "error", text: "Record may already exist." }); } finally { setSaving(false); }
  };

  const saveYear = async () => {
    if (!placementId) { setMsg({ type: "error", text: "Initialize placement record first." }); return; }
    setSaving(true); setMsg({ type: "", text: "" });
    try {
      const payload = {
        year,
        placements: rows.map((r) => ({
          branch: r.branch, highestPackage: Number(r.highestPackage), averagePackage: Number(r.averagePackage),
          lowestPackage: Number(r.lowestPackage), placementPercentage: Number(r.placementPercentage),
          studentsPlaced: Number(r.studentsPlaced), totalStudents: Number(r.totalStudents),
        })),
      };
      await api.patch(`/placements/${placementId}/year`, payload);
      if (!existingYears.includes(year)) setExistingYears((p) => [...p, year]);
      setMsg({ type: "success", text: `Saved ${selectedCollege?.name} – ${year}` });
    } catch { setMsg({ type: "error", text: "Failed to save." }); } finally { setSaving(false); }
  };

  const updateRow = (i: number, field: string, val: string) =>
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const ROW_FIELDS: { key: keyof PlacementRow; label: string }[] = [
    { key: "branch", label: "Branch" }, { key: "highestPackage", label: "Highest (LPA)" },
    { key: "averagePackage", label: "Average (LPA)" }, { key: "lowestPackage", label: "Lowest (LPA)" },
    { key: "placementPercentage", label: "Placed %" }, { key: "studentsPlaced", label: "Students Placed" },
    { key: "totalStudents", label: "Total Students" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Placements Admin</h2>

        {/* College Selector */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Select College</label>
          {loadingColleges ? (
            <div className="flex items-center gap-2 text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : (
            <select value={selectedCollegeId} onChange={(e) => setSelectedCollegeId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Choose a college…</option>
              {colleges.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          )}
        </div>

        {msg.text && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {msg.text}
          </div>
        )}

        {selectedCollegeId && (
          loadingPlacement ? (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
              <LoaderCircle className="h-5 w-5 animate-spin" /> Loading placement data…
            </div>
          ) : (
            <>
              {/* Status + init */}
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{selectedCollege?.name}</p>
                  <p className="text-xs text-slate-500">{placementId ? `Record ready · Years: ${existingYears.sort((a, b) => b - a).join(", ") || "none"}` : "No placement record yet."}</p>
                </div>
                {!placementId && (
                  <button onClick={initRecord} disabled={saving} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">
                    {saving ? "Initializing…" : "Initialize Record"}
                  </button>
                )}
              </div>

              {/* Year editor */}
              {placementId && (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Placement Year</label>
                      <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))}
                        className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {rows.map((row, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">Branch {i + 1}</span>
                          <button onClick={() => setRows((p) => p.length === 1 ? p : p.filter((_, idx) => idx !== i))}
                            disabled={rows.length === 1} className="text-xs text-rose-500 disabled:opacity-30">Remove</button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {ROW_FIELDS.map(({ key, label }) => (
                            <div key={key}>
                              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</label>
                              <input type={key === "branch" ? "text" : "number"} value={row[key]}
                                onChange={(e) => updateRow(i, key, e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setRows((p) => [...p, EMPTY_ROW()])}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      <Plus className="h-4 w-4" /> Add Branch
                    </button>
                    <button onClick={saveYear} disabled={saving}
                      className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60">
                      {saving ? "Saving…" : "Save Year Data"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>
    </AdminLayout>
  );
}
