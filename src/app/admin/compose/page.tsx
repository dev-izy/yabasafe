import { requireStaff } from "@/lib/auth";
import { REPORT_TO_ALERT, type MusterPoint, type ReportType } from "@/lib/types";
import { ComposeForm } from "./compose-form";

export const metadata = { title: "Create alert · YabaSafe" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ComposePage({ searchParams }: { searchParams: Promise<{ report?: string }> }) {
  const { supabase } = await requireStaff();
  const { report } = await searchParams;

  // Coming from "Create alert from this report": start the form with what the student reported.
  let initial: { reportId: string; type: (typeof REPORT_TO_ALERT)[ReportType]; area: string; details: string } | undefined;
  if (report && UUID.test(report)) {
    const { data: r } = await supabase
      .from("incident_reports")
      .select("id, type, location, details")
      .eq("id", report)
      .maybeSingle<{ id: string; type: ReportType; location: string; details: string }>();
    if (r) initial = { reportId: r.id, type: REPORT_TO_ALERT[r.type], area: r.location, details: r.details };
  }

  const [pointsRes, peopleRes] = await Promise.all([
    supabase.from("muster_points").select("*").eq("active", true).order("sort").returns<MusterPoint[]>(),
    supabase
      .from("profiles")
      .select("department, hostel")
      .eq("role", "student")
      .limit(5000)
      .returns<{ department: string | null; hostel: string | null }[]>(),
  ]);

  const people = peopleRes.data ?? [];
  const distinct = (pick: (p: { department: string | null; hostel: string | null }) => string | null) =>
    [...new Set(people.map(pick).filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Create alert</h1>
        <p className="text-muted">Alerts appear instantly in the app for everyone in the audience.</p>
      </header>
      <ComposeForm initial={initial} points={pointsRes.data ?? []} departments={distinct((p) => p.department)} hostels={distinct((p) => p.hostel)} />
    </div>
  );
}
