import { redirect } from "next/navigation";
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-6xl font-black text-indigo-600">404</h1>
      <p className="text-xl font-bold text-slate-900">Page not found</p>
      <p className="max-w-sm text-sm text-slate-500">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <a href="/" className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">Go Home</a>
    </main>
  );
}
