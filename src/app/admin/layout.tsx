import { requireStaff } from "@/lib/auth";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { AdminNav } from "./nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireStaff();
  const { count } = await supabase
    .from("incident_reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <RealtimeRefresh tables={["incident_reports"]} />
      <AdminNav name={profile.full_name} role={profile.role} newReports={count ?? 0} />
      <main className="min-w-0 flex-1 p-5 md:px-10 md:py-8">{children}</main>
    </div>
  );
}