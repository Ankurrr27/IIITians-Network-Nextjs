"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/apiClient";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { router.replace("/admin"); return; }
    api.get("/admin/me")
      .then(() => { setAuthorized(true); setChecking(false); })
      .catch(() => { localStorage.removeItem("adminToken"); router.replace("/admin"); });
  }, [router]);

  if (checking) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
    </div>
  );

  if (!authorized) return null;
  return <>{children}</>;
}
