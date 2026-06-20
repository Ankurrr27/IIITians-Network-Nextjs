// src/app/club/register/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ClubRegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-indigo-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <ClubRegisterPageClient />
    </Suspense>
  );
}

function ClubRegisterPageClient() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/discuss?clubAccount=true");
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-indigo-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-600">Redirecting to Club Registration...</p>
      </div>
    </div>
  );
}
