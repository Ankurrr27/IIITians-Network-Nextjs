import LogoLoader from "@/components/LogoLoader";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-transparent">
      <LogoLoader />
    </div>
  );
}
