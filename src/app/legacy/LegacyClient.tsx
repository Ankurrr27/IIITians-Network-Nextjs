"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Briefcase,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  GraduationCap,
  Instagram,
  Linkedin,
  Mail,
  Milestone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import api from "@/lib/apiClient";
import type { IAlumni, ICollege, ITeamMember } from "@/types";
import ImageCropModal from "@/components/ImageCropModal";
import useThemeMode from "@/hooks/useThemeMode";
import { notifyPromise } from "@/utils/appNotifications";

interface Props {
  initialAlumni: IAlumni[];
}

type LegacyForm = {
  name: string;
  email: string;
  iiit: string;
  graduationYear: string;
  generation: string;
  branch: string;
  networkPost: string;
  currentRole: string;
  currentCompany: string;
  location: string;
  linkedin: string;
  instagram: string;
  bio: string;
};

type LegacyStatsData = {
  totalProfiles: number;
  networkPosts: number;
  companies: number;
  batches: number;
};

const initialForm: LegacyForm = {
  name: "",
  email: "",
  iiit: "",
  graduationYear: "",
  generation: "",
  branch: "",
  networkPost: "",
  currentRole: "",
  currentCompany: "",
  location: "",
  linkedin: "",
  instagram: "",
  bio: "",
};

const legacyFormFields: Array<
  [keyof LegacyForm, string, string, string, boolean, string]
> = [
  ["name", "Full name", "e.g. Ankur Singh", "text", true, ""],
  ["email", "Email address", "e.g. ankur@email.com", "email", true, ""],
  ["generation", "Team term or batch", "e.g. 2024-28 or 2021-25", "text", true, ""],
  ["graduationYear", "Graduation year", "e.g. 2028", "number", true, ""],
  ["branch", "Branch", "e.g. CSE", "text", true, ""],
  ["networkPost", "Latest network post", "e.g. Vice President", "text", false, ""],
  ["currentRole", "Current role / designation", "e.g. Product Designer Intern", "text", false, ""],
  ["currentCompany", "Current company / organization", "e.g. Adobe / Freelance", "text", false, ""],
  ["location", "Current location", "e.g. Bengaluru, India", "text", false, ""],
  ["linkedin", "LinkedIn profile URL", "e.g. https://linkedin.com/in/ankur-singh", "text", false, "sm:col-span-2"],
  ["instagram", "Instagram profile URL", "e.g. https://instagram.com/ankurwrites", "text", false, "sm:col-span-2"],
];

const cardShell = {
  light: "border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]",
  dark: "border-slate-800 bg-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.26)]",
};

const itemsPerPage = 12;

const normalizeText = (value = "") => value.trim().toLowerCase();

function normalizeCollegeName(name = "") {
  const normalized = name.trim().toLowerCase();
  if (
    normalized.includes("sricity") ||
    normalized.includes("sri city") ||
    normalized === "chittoor" ||
    (normalized.includes("iiit") && normalized.includes("chittoor"))
  ) {
    return "iiit sricity_chittoor_canonical";
  }
  return normalized;
}

function getLegacyStats(statsData: LegacyStatsData) {
  return [
    { label: "Legacy profiles", value: statsData.totalProfiles || 0, icon: Users },
    { label: "Network posts", value: statsData.networkPosts || 0, icon: ShieldCheck },
    { label: "Companies listed", value: statsData.companies || 0, icon: Building2 },
    { label: "Batches visible", value: statsData.batches || 0, icon: GraduationCap },
  ];
}

function dedupeRoleHistory(roleHistory: IAlumni["roleHistory"] = []) {
  return roleHistory.filter((item, index, list) => {
    const signature = `${normalizeText(item.year || "")}|${normalizeText(item.team || "")}|${normalizeText(item.role || "")}`;
    return (
      index ===
      list.findIndex((candidate) => {
        const candidateSignature = `${normalizeText(candidate.year || "")}|${normalizeText(candidate.team || "")}|${normalizeText(candidate.role || "")}`;
        return candidateSignature === signature;
      })
    );
  });
}

function getLegacyEntryViewModel(entry: IAlumni) {
  const companyValue = entry.currentCompany || "";
  const normalizedNetworkPost = normalizeText(entry.networkPost);
  const normalizedCurrentRole = normalizeText(entry.currentRole);
  const normalizedCurrentCompany = normalizeText(companyValue);
  const normalizedIiit = normalizeText(entry.iiit);
  const dedupedRoleHistory = dedupeRoleHistory(entry.roleHistory || []);

  return {
    companyValue,
    showRoleChip: !!entry.currentRole && normalizedCurrentRole !== normalizedNetworkPost,
    showCompanyChip: !!companyValue && normalizedCurrentCompany !== normalizedIiit,
    dedupedRoleHistory,
    totalTerms: dedupedRoleHistory.length,
  };
}

function deriveStats(entries: IAlumni[]): LegacyStatsData {
  return {
    totalProfiles: entries.length,
    networkPosts: new Set(entries.map((entry) => entry.networkPost).filter(Boolean)).size,
    companies: new Set(entries.map((entry) => entry.currentCompany).filter(Boolean)).size,
    batches: new Set(entries.map((entry) => entry.generation).filter(Boolean)).size,
  };
}

export default function LegacyClient({ initialAlumni }: Props) {
  const { isDarkMode } = useThemeMode();
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<IAlumni[]>(initialAlumni);
  const [collegeOptions, setCollegeOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [generationFilter, setGenerationFilter] = useState(searchParams.get("generation") || "");
  const [iiitFilter, setIiitFilter] = useState(searchParams.get("iiit") || "");
  const [professionalStatusFilter, setProfessionalStatusFilter] = useState(searchParams.get("professionalStatus") || "");
  const [legacyTypeFilter, setLegacyTypeFilter] = useState(searchParams.get("legacyType") || "");
  const [networkPostFilter, setNetworkPostFilter] = useState(searchParams.get("networkPost") || "");
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ loading: false, error: "", success: "" });
  const [form, setForm] = useState<LegacyForm>(initialForm);
  const [teamMembers, setTeamMembers] = useState<ITeamMember[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [rawPhoto, setRawPhoto] = useState<File | null>(null);
  const [useTeamPhoto, setUseTeamPhoto] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [statsData, setStatsData] = useState<LegacyStatsData>(deriveStats(initialAlumni));

  const fetchEntries = async (filters = {}, page = currentPage) => {
    setLoading(true);

    const promise = api.get("/alumni", {
      params: {
        search,
        generation: generationFilter,
        iiit: iiitFilter,
        professionalStatus: professionalStatusFilter,
        legacyType: legacyTypeFilter,
        networkPost: networkPostFilter,
        page,
        limit: itemsPerPage,
        ...filters,
      },
    });

    notifyPromise(promise, {
      loading: "Updating network legacy directory...",
      success: "Directory updated",
    }).catch(() => undefined);

    try {
      const response = await promise;
      const data = response.data;
      const nextEntries = data?.alumni ?? data ?? [];
      setEntries(nextEntries);
      if (data?.pagination) setPagination(data.pagination);
      if (data?.stats) setStatsData(data.stats);
      setApiUnavailable(false);
    } catch (error: any) {
      if (error.response?.status === 404) setApiUnavailable(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSupportingData = async () => {
      const [teamRes, collegeRes] = await Promise.allSettled([
        api.get<ITeamMember[]>("/team"),
        api.get<ICollege[]>("/colleges"),
      ]);

      if (teamRes.status === "fulfilled") setTeamMembers(teamRes.value.data || []);
      if (collegeRes.status === "fulfilled") {
        setCollegeOptions((collegeRes.value.data || []).map((college) => college.name).filter(Boolean));
      }
    };

    loadSupportingData();
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setGenerationFilter(searchParams.get("generation") || "");
    setIiitFilter(searchParams.get("iiit") || "");
    setProfessionalStatusFilter(searchParams.get("professionalStatus") || "");
    setLegacyTypeFilter(searchParams.get("legacyType") || "");
    setNetworkPostFilter(searchParams.get("networkPost") || "");
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchEntries({}, 1);
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, generationFilter, iiitFilter, professionalStatusFilter, legacyTypeFilter, networkPostFilter]);

  useEffect(() => {
    fetchEntries({}, currentPage);
  }, [currentPage]);

  const matchedTeamMember = useMemo(() => {
    const normalizedEmail = form.email.trim().toLowerCase();
    if (!normalizedEmail) return null;

    return (
      [...teamMembers]
        .filter((member) => (member.email || "").trim().toLowerCase() === normalizedEmail)
        .sort((a, b) => String(b.year || "").localeCompare(String(a.year || ""), undefined, { numeric: true }))[0] || null
    );
  }, [form.email, teamMembers]);

  const generationOptions = useMemo(() => {
    const values = entries.map((entry) => entry.generation).filter((value): value is string => Boolean(value));
    return [...new Set(values)].sort((a, b) => b.localeCompare(a));
  }, [entries]);

  const iiitOptions = useMemo(() => {
    const values = [
      ...entries.map((entry) => entry.iiit).filter((value): value is string => Boolean(value)),
      ...collegeOptions,
    ];
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [entries, collegeOptions]);

  const networkPostOptions = useMemo(() => {
    const values = entries.map((entry) => entry.networkPost).filter((value): value is string => Boolean(value));
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const stats = useMemo(() => getLegacyStats(statsData), [statsData]);
  const totalPages = pagination.totalPages ?? 1;

  const filterSelectClass = `w-full appearance-none rounded-2xl border px-4 py-3 pr-12 text-sm outline-none transition duration-300 truncate sm:text-base ${
    isDarkMode
      ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
      : "border-slate-200 bg-white/90 text-slate-900 shadow-sm focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
  }`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitState.loading) return;

    setSubmitState({ loading: true, error: "", success: "" });

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (photo) formData.append("photo", photo);

      const promise = api.post("/alumni", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await notifyPromise(promise, {
        loading: "Submitting your legacy profile request...",
        success: "Request submitted successfully!",
      });

      setForm(initialForm);
      setPhoto(null);
      setRawPhoto(null);
      setUseTeamPhoto(true);
      setIsFormOpen(false);
      setSubmitState({
        loading: false,
        error: "",
        success: "Your Network Legacy request has been submitted. It will appear after admin approval.",
      });
      setApiUnavailable(false);
      fetchEntries();
    } catch (error: any) {
      const notDeployed = error.response?.status === 404;
      if (notDeployed) setApiUnavailable(true);

      setSubmitState({
        loading: false,
        success: "",
        error: notDeployed
          ? "The Network Legacy API is not live on the backend yet. Redeploy the backend service first."
          : error.response?.data?.message || "Could not save your details right now.",
      });
    }
  };

  return (
    <div
      className={`relative min-h-screen ${
        isDarkMode ? "bg-slate-950" : "bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8faff_40%,_#ffffff_100%)]"
      } pb-16 pt-20 text-slate-900 sm:pb-24 sm:pt-24`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_0_22%),radial-gradient(circle_at_80%_18%,rgba(125,211,252,0.18),transparent_0_20%),radial-gradient(circle_at_72%_72%,rgba(96,165,250,0.12),transparent_0_24%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <LegacyHeroSection isDarkMode={isDarkMode} stats={stats} />

        <div className="space-y-3 pb-10 sm:space-y-4 sm:pb-16">
          {apiUnavailable && (
            <div
              className={`rounded-[1.5rem] border px-4 py-3 text-sm leading-7 sm:px-5 sm:py-4 ${
                isDarkMode ? "border-amber-900 bg-amber-950/40 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              The deployed backend does not have `/api/alumni` live yet. Redeploy the backend before testing the Network Legacy page fully.
            </div>
          )}

          {submitState.error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitState.error}
            </div>
          )}

          {submitState.success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {submitState.success}
            </div>
          )}

          <div
            className={`overflow-hidden rounded-[1.25rem] border p-4 shadow-[0_22px_60px_rgba(99,102,241,0.08)] sm:p-5 ${
              isDarkMode ? cardShell.dark : "border-indigo-100 bg-[linear-gradient(135deg,rgba(239,246,255,0.9),rgba(255,255,255,0.95))]"
            }`}
          >
            <LegacySubmissionSection
              isDarkMode={isDarkMode}
              isFormOpen={isFormOpen}
              setIsFormOpen={setIsFormOpen}
              handleSubmit={handleSubmit}
              submitState={submitState}
              form={form}
              handleChange={handleChange}
              iiitOptions={iiitOptions}
              matchedTeamMember={matchedTeamMember}
              photo={photo}
              setRawPhoto={setRawPhoto}
              useTeamPhoto={useTeamPhoto}
              setUseTeamPhoto={setUseTeamPhoto}
            />

            <div
              className={`my-8 h-px ${
                isDarkMode
                  ? "bg-gradient-to-r from-transparent via-slate-700 to-transparent"
                  : "bg-gradient-to-r from-transparent via-indigo-200/50 to-transparent"
              }`}
            />

            <LegacyFiltersSection
              isDarkMode={isDarkMode}
              search={search}
              setSearch={setSearch}
              areFiltersOpen={areFiltersOpen}
              setAreFiltersOpen={setAreFiltersOpen}
              generationFilter={generationFilter}
              setGenerationFilter={setGenerationFilter}
              iiitFilter={iiitFilter}
              setIiitFilter={setIiitFilter}
              professionalStatusFilter={professionalStatusFilter}
              setProfessionalStatusFilter={setProfessionalStatusFilter}
              legacyTypeFilter={legacyTypeFilter}
              setLegacyTypeFilter={setLegacyTypeFilter}
              networkPostFilter={networkPostFilter}
              setNetworkPostFilter={setNetworkPostFilter}
              generationOptions={generationOptions}
              iiitOptions={iiitOptions}
              networkPostOptions={networkPostOptions}
              filterSelectClass={filterSelectClass}
            />
          </div>

          <LegacyEntriesSection isDarkMode={isDarkMode} loading={loading} entries={entries} />

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <div className="text-sm font-medium text-slate-400">
                Page <span className="font-bold text-slate-900">{currentPage}</span> of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {rawPhoto && (
        <ImageCropModal
          file={rawPhoto}
          aspect={1}
          onClose={() => setRawPhoto(null)}
          onCrop={(croppedFile) => {
            setPhoto(croppedFile);
            setRawPhoto(null);
          }}
        />
      )}
    </div>
  );
}

function LegacyHeroSection({ isDarkMode, stats }: { isDarkMode: boolean; stats: ReturnType<typeof getLegacyStats> }) {
  return (
    <div className="relative pb-8 sm:pb-12 lg:pb-14">
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl lg:pr-8">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] ${
              isDarkMode ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-400" : "border-indigo-100 bg-white/90 text-indigo-700 shadow-sm"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Network Legacy
          </div>

          <h1 className={`mt-4 text-2xl font-semibold tracking-tight sm:text-4xl ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
            Network Legacy
          </h1>

          <p className={`mt-4 max-w-3xl text-sm leading-7 sm:text-base ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
            "Once a member of the network, always a part of its legacy."
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 lg:flex-shrink-0 lg:items-end lg:justify-end">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-4 transition-transform hover:translate-y-[-1px]">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isDarkMode ? "bg-indigo-500/10" : "bg-indigo-50"}`}>
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className={`text-xl font-bold leading-none ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{item.value}</div>
                  <div className={`mt-1.5 text-[10px] font-bold uppercase tracking-[0.15em] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`mt-10 h-px w-full ${
          isDarkMode ? "bg-gradient-to-r from-transparent via-slate-700 to-transparent" : "bg-gradient-to-r from-transparent via-indigo-100 to-transparent"
        }`}
      />
    </div>
  );
}

function LegacySubmissionSection({
  isDarkMode,
  isFormOpen,
  setIsFormOpen,
  handleSubmit,
  submitState,
  form,
  handleChange,
  iiitOptions,
  matchedTeamMember,
  photo,
  setRawPhoto,
  useTeamPhoto,
  setUseTeamPhoto,
}: {
  isDarkMode: boolean;
  isFormOpen: boolean;
  setIsFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: (event: React.FormEvent) => void;
  submitState: { loading: boolean };
  form: LegacyForm;
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  iiitOptions: string[];
  matchedTeamMember: ITeamMember | null;
  photo: File | null;
  setRawPhoto: (file: File) => void;
  useTeamPhoto: boolean;
  setUseTeamPhoto: (value: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-6">
        <div className="max-w-2xl">
          <h2 className={`text-xl font-semibold sm:text-2xl ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
            Add your Network Legacy profile
          </h2>
          <p className={`mt-2 text-sm leading-6 sm:leading-7 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Send your profile for review. Only approved entries are shown in the public legacy page.
          </p>
          <Link
            href="/guide"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
          >
            Need help? Open Guide
          </Link>
          <Link
            href="/legacy/certificate"
            className="ml-0 mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm sm:ml-3 sm:mt-4"
          >
            Get legacy certificate
          </Link>
        </div>

        <div className="flex items-center justify-start lg:justify-end">
          <button
            type="button"
            onClick={() => setIsFormOpen((prev) => !prev)}
            className="inline-flex min-w-[11rem] items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#4f46e5,#6366f1)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(99,102,241,0.28)] transition duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_24px_44px_rgba(99,102,241,0.34)] active:scale-[0.99]"
          >
            {isFormOpen ? "Close form" : "Open form"}
            {isFormOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {legacyFormFields.map(([name, label, placeholder, type, required, span]) => (
              <label key={name} className={`flex flex-col gap-2 ${span}`}>
                <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  {label}
                  {required ? " *" : ""}
                </span>
                <input
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required={required}
                  className={`rounded-2xl border px-4 py-3 text-sm outline-none transition sm:text-base ${
                    isDarkMode
                      ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  }`}
                />
              </label>
            ))}

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Institute *
              </span>
              <input
                name="iiit"
                list="legacy-iiit-options"
                type="text"
                value={form.iiit}
                onChange={handleChange}
                placeholder="Choose or type an IIIT, e.g. IIIT Kota"
                required
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition sm:text-base ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                }`}
              />
              <datalist id="legacy-iiit-options">
                {iiitOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <p className="mt-2 text-xs text-slate-500">Pick from the existing IIIT list if available so your profile is easier to group correctly.</p>
            </label>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Legacy message / bio
              </span>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="e.g. I worked across social media and leadership in IIITians Network, and now I am focused on building stronger student communities."
                rows={4}
                className={`rounded-2xl border px-4 py-3 text-sm outline-none transition sm:text-base ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                }`}
              />
            </label>
          </div>

          <div
            className={`rounded-2xl border p-4 max-sm:border-transparent max-sm:bg-transparent max-sm:px-0 max-sm:py-1 ${
              isDarkMode ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={`text-sm font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>Legacy photo</p>
                <p className={`mt-1 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Upload a photo, or reuse your team photo if you already appear on the team page.
                </p>
              </div>

              <label
                htmlFor="legacy-photo-upload"
                className="inline-flex cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
              >
                {photo ? "Replace photo" : "Upload photo"}
              </label>
            </div>

            <input
              id="legacy-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const nextFile = event.target.files?.[0];
                if (nextFile) {
                  setRawPhoto(nextFile);
                  setUseTeamPhoto(false);
                }
                event.target.value = "";
              }}
            />

            {matchedTeamMember?.photo?.url && (
              <label className={`mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${isDarkMode ? "bg-slate-900 text-slate-300" : "bg-white text-slate-700"}`}>
                <input
                  type="checkbox"
                  checked={useTeamPhoto && !photo}
                  onChange={(event) => setUseTeamPhoto(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Use same photo as your team profile
                <span className="font-medium text-indigo-600">{matchedTeamMember.name}</span>
              </label>
            )}

            {(photo || (useTeamPhoto && matchedTeamMember?.photo?.url)) && (
              <div className="mt-4 flex items-center gap-3">
                <Image
                  src={photo ? URL.createObjectURL(photo) : matchedTeamMember?.photo?.url || ""}
                  alt="Legacy profile preview"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-2xl object-cover ring-1 ring-slate-200"
                />
                <div className="text-sm text-slate-600">{photo ? "Cropped photo ready for upload" : "Using existing team photo"}</div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitState.loading}
            className="w-full rounded-2xl bg-[linear-gradient(135deg,#4f46e5,#6366f1)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(99,102,241,0.24)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_24px_44px_rgba(99,102,241,0.3)] hover:brightness-[1.02] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {submitState.loading ? "Submitting..." : "Send legacy request"}
          </button>
        </form>
      )}
    </div>
  );
}

function LegacyFiltersSection({
  isDarkMode,
  search,
  setSearch,
  areFiltersOpen,
  setAreFiltersOpen,
  generationFilter,
  setGenerationFilter,
  iiitFilter,
  setIiitFilter,
  professionalStatusFilter,
  setProfessionalStatusFilter,
  legacyTypeFilter,
  setLegacyTypeFilter,
  networkPostFilter,
  setNetworkPostFilter,
  generationOptions,
  iiitOptions,
  networkPostOptions,
  filterSelectClass,
}: {
  isDarkMode: boolean;
  search: string;
  setSearch: (value: string) => void;
  areFiltersOpen: boolean;
  setAreFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  generationFilter: string;
  setGenerationFilter: (value: string) => void;
  iiitFilter: string;
  setIiitFilter: (value: string) => void;
  professionalStatusFilter: string;
  setProfessionalStatusFilter: (value: string) => void;
  legacyTypeFilter: string;
  setLegacyTypeFilter: (value: string) => void;
  networkPostFilter: string;
  setNetworkPostFilter: (value: string) => void;
  generationOptions: string[];
  iiitOptions: string[];
  networkPostOptions: string[];
  filterSelectClass: string;
}) {
  return (
    <div>
      <div className="max-w-2xl px-1 pb-2 sm:px-0 sm:pb-3">
        <h2 className={`text-xl font-semibold sm:text-2xl ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>Search Network Legacy</h2>
        <p className={`mt-0.5 text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          Filter by name, batch, network post, professional role, company, or institute.
        </p>
      </div>

      <div className="p-0 sm:p-1">
        <div className="flex items-center gap-3">
          <label className="relative block flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try: Ankur, Vice President, Adobe, CSE, or IIIT Surat"
              className={`w-full rounded-2xl border px-11 py-3 text-sm outline-none transition duration-300 placeholder:text-slate-500 sm:text-base ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950 text-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  : "border-slate-200 bg-white/90 text-slate-900 shadow-sm focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              }`}
            />
          </label>

          <button
            type="button"
            onClick={() => setAreFiltersOpen((prev) => !prev)}
            className={`inline-flex h-[3.15rem] w-[3.15rem] flex-shrink-0 items-center justify-center rounded-2xl border transition sm:w-auto sm:gap-2 sm:px-4 ${
              isDarkMode ? "border-slate-700 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-700 shadow-sm"
            }`}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
            <span className="hidden text-sm font-semibold sm:inline">Filters</span>
          </button>
        </div>

        <div className={`${areFiltersOpen ? "mt-4 grid" : "hidden"} gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]`}>
          <FilterSelect value={generationFilter} onChange={setGenerationFilter} title={generationFilter || "All generations"} className={filterSelectClass}>
            <option value="">All generations</option>
            {generationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect value={iiitFilter} onChange={setIiitFilter} title={iiitFilter || "All institutes"} className={filterSelectClass}>
            <option value="">All institutes</option>
            {iiitOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect value={professionalStatusFilter} onChange={setProfessionalStatusFilter} title="All professional stages" className={filterSelectClass}>
            <option value="">All professional stages</option>
            <option value="working">Working professionals</option>
            <option value="open">Open to next move</option>
          </FilterSelect>

          <FilterSelect value={legacyTypeFilter} onChange={setLegacyTypeFilter} title="All legacy types" className={filterSelectClass}>
            <option value="">All legacy types</option>
            <option value="team_member">Team members</option>
            <option value="alumni">Submitted alumni</option>
          </FilterSelect>

          <FilterSelect value={networkPostFilter} onChange={setNetworkPostFilter} title={networkPostFilter || "All network posts"} className={filterSelectClass}>
            <option value="">All network posts</option>
            {networkPostOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </FilterSelect>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setGenerationFilter("");
              setIiitFilter("");
              setProfessionalStatusFilter("");
              setLegacyTypeFilter("");
              setNetworkPostFilter("");
            }}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 sm:text-base ${
              isDarkMode ? "border-slate-700 bg-slate-950 text-slate-100 hover:bg-slate-900" : "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow-md"
            }`}
          >
            Clear filters
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  title,
  className,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  title: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={(event) => onChange(event.target.value)} title={title} className={className}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function LegacyEntriesSection({ isDarkMode, loading, entries }: { isDarkMode: boolean; loading: boolean; entries: IAlumni[] }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <LegacyEntrySkeleton key={index} isDarkMode={isDarkMode} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div
        className={`rounded-[1.25rem] border border-dashed p-5 text-center sm:p-6 ${
          isDarkMode ? "border-slate-700 bg-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.25)]" : "border-slate-300 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]"
        }`}
      >
        <h3 className={`text-lg font-semibold sm:text-xl ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>No legacy profiles match this search yet</h3>
        <p className={`mt-2 text-sm leading-7 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
          Try another search term or open the form above to submit a new profile request.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4">
      {entries.map((entry) => (
        <LegacyEntryCard key={entry._id} entry={entry} isDarkMode={isDarkMode} />
      ))}
    </div>
  );
}

function LegacyEntrySkeleton({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className={`animate-pulse overflow-hidden rounded-[1.25rem] border ${isDarkMode ? cardShell.dark : cardShell.light}`}>
      <div className="flex flex-col lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="h-64 bg-slate-200 sm:h-72 lg:h-[22rem]" />
        <div className="space-y-5 p-4 sm:p-6 lg:p-7">
          <div className="h-10 w-2/3 rounded-2xl bg-slate-200" />
          <div className="h-24 rounded-[1.4rem] bg-slate-100" />
          <div className="h-20 rounded-[1.5rem] bg-slate-50" />
        </div>
      </div>
    </div>
  );
}

function LegacyEntryCard({ entry, isDarkMode }: { entry: IAlumni; isDarkMode: boolean }) {
  const { dedupedRoleHistory, totalTerms } = getLegacyEntryViewModel(entry);
  const contribution = entry.contribution?.trim();
  const message = entry.bio?.trim();
  const hasJourney = dedupedRoleHistory.length > 0;
  const serviceLine =
    entry.legacyType === "team_member" && totalTerms > 0
      ? `${entry.iiit} - Served ${totalTerms} ${totalTerms > 1 ? "terms" : "term"}`
      : `${entry.iiit} - Class of ${entry.graduationYear}`;
  const roleLine = [entry.networkPost, entry.currentRole, entry.currentCompany].filter(Boolean).join(" / ");
  const displayMessage =
    message ||
    `${entry.name} is part of the IIITians Network legacy and has contributed to the community through their journey.`;

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.25rem] border transition-all duration-500 hover:-translate-y-0.5 ${
        isDarkMode
          ? "border-slate-800 bg-slate-900/80 shadow-[0_20px_50px_rgba(2,6,23,0.32)] backdrop-blur-md"
          : "border-slate-100 bg-white shadow-[0_12px_30px_rgba(99,102,241,0.06)]"
      }`}
    >
      <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="relative min-h-72 overflow-hidden bg-slate-50 sm:min-h-80 lg:min-h-[24rem]">
          {entry.photo?.url ? (
            <Image
              src={entry.photo.url}
              alt={entry.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 352px"
            />
          ) : (
            <div className="flex h-full min-h-72 items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 text-7xl font-extrabold text-indigo-200">
              {entry.name?.[0]}
            </div>
          )}
        </div>

        <div
          className={`grid gap-4 p-5 sm:p-6 lg:p-6 ${
            hasJourney ? "md:grid-cols-[minmax(0,1fr)_18rem] md:items-center xl:grid-cols-[minmax(0,1fr)_21rem]" : ""
          }`}
        >
          <div className="min-w-0">
            <h3 className={`text-2xl leading-tight font-bold tracking-tight sm:text-3xl ${isDarkMode ? "text-slate-50" : "text-indigo-900"}`}>
              {entry.name}
            </h3>

            <p className={`mt-2 text-sm font-medium sm:text-sm ${isDarkMode ? "text-slate-300" : "text-indigo-700"}`}>
              {serviceLine}
            </p>

            {contribution && (
              <div className={`mt-5 rounded-[1.35rem] border p-3 sm:p-4 ${
                isDarkMode
                  ? "border-indigo-500/20 bg-indigo-900/10"
                  : "border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50"
              }`}>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${isDarkMode ? "text-indigo-200" : "text-indigo-700"}`}>
                  Contribution made
                </p>
                <p className={`mt-2 line-clamp-4 text-sm font-normal leading-6 sm:text-sm ${isDarkMode ? "text-slate-300" : "text-slate-800"}`}>
                  {contribution}
                </p>
              </div>
            )}


            {roleLine && (
              <p className={`mt-3 line-clamp-2 text-sm font-medium leading-6 ${isDarkMode ? "text-slate-300" : "text-indigo-800"}`}>
                {roleLine}
              </p>
            )}

            {displayMessage && (
              <p className={`mt-2 line-clamp-3 text-sm font-normal leading-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                {displayMessage}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${entry.email}`}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-950/40 text-slate-300 hover:border-indigo-400 hover:text-indigo-300"
                    : "border-transparent bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:shadow-sm"
                }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isDarkMode ? "bg-slate-800" : "bg-white shadow-sm"}`}>
                  <Mail className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">Email</span>
              </a>
              {entry.linkedin && (
                <a
                  href={entry.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 ${
                    isDarkMode
                      ? "border-slate-700 bg-slate-950/40 text-slate-300 hover:border-indigo-400 hover:text-indigo-300"
                      : "border-transparent bg-white text-indigo-700 hover:bg-indigo-50 hover:shadow-sm"
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isDarkMode ? "bg-slate-800" : "bg-white shadow-sm"}`}>
                    <Linkedin className="h-4 w-4 text-indigo-600" />
                  </span>
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              )}
              {entry.instagram && (
                <a
                  href={entry.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 ${
                    isDarkMode
                      ? "border-slate-700 bg-slate-950/40 text-slate-300 hover:border-indigo-400 hover:text-indigo-300"
                      : "border-transparent bg-white text-indigo-700 hover:bg-indigo-50 hover:shadow-sm"
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isDarkMode ? "bg-slate-800" : "bg-white shadow-sm"}`}>
                    <Instagram className="h-4 w-4 text-pink-500" />
                  </span>
                  <span className="text-sm font-medium">Instagram</span>
                </a>
              )}
            </div>
          </div>

          {hasJourney && (
            <aside className={`rounded-[1.25rem] p-4 sm:p-5 ${
              isDarkMode
                ? "bg-slate-950/70 ring-1 ring-slate-800"
                : "bg-gradient-to-b from-indigo-50/60 to-violet-50 ring-1 ring-indigo-100"
            }`}>
              <h4 className={`text-xs font-semibold ${isDarkMode ? "text-indigo-300" : "text-indigo-700"}`}>
                Network Journey
              </h4>
              <div className="relative mt-5 space-y-4 pl-7">
                <div className={`absolute bottom-1 left-[0.45rem] top-1 w-px ${isDarkMode ? "bg-slate-600" : "bg-indigo-200"}`} />
                {dedupedRoleHistory.map((item, index) => (
                  <div key={`${item.year}-${item.team}-${item.role}-${index}`} className="relative">
                    <span className={`absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full ring-3 ${
                      isDarkMode ? "bg-indigo-300 ring-slate-950" : "bg-indigo-700 ring-indigo-50"
                    }`} />
                    <p className={`text-sm font-semibold leading-5 ${isDarkMode ? "text-slate-100" : "text-slate-950"}`}>
                      {item.role || entry.networkPost || "Legacy Member"}
                    </p>
                    <p className={`mt-1 text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {[item.year, item.team].filter(Boolean).join(" - ")}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </article>
  );
}
