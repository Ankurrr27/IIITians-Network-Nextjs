import { redirect } from "next/navigation";

export default async function AlumniAdminStatusRedirect({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;
  redirect(`/legacy/admin/${status}`);
}
