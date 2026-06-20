import { redirect } from "next/navigation";

export default function AlumniAdminRedirect() {
  redirect("/legacy/admin");
}
