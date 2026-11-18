import { requireMember } from "@/lib/auth";
import { Icon } from "@/components/icons";
import { fmtWhen } from "@/lib/format";
import { REPORT_LABEL, REPORT_STATUS_LABEL, type IncidentReport, type ReportStatus } from "@/lib/types";
import { ReportForm } from "../report/report-form";

export const metadata = { title: "Report an incident · YabaSafe Alert" };

const TONE: Record<ReportStatus, string> = {
  new: "text-[#ffc95c]",
  acknowledged: "text-brand-soft",
  responding: "text-[#6be8c3]",
  resolved: "text-[#6be8c3]",
  dismissed: "text-muted",
};

export default async function ReportPage() {
  const { supabase, user } = await requireMember();
  const { data } = await supabase
    .from("incident_reports")
    .select("*")
    .eq("reporter_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<IncidentReport[]>();
  const reports = data ?? [];
  const fireUnit = process.env.NEXT_PUBLIC_FIRE_UNIT_PHONE;

  return (
    <div className="flex flex-1 flex-col gap-5 p-5 pt-7">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold">Report an incident</h1>
        <p className="text-muted">Tell the safety unit what you can see. They check every report before alerting anyone.</p>
      </header>

      <section
        aria-labelledby="call-h"
        className="flex flex-col gap-3 rounded-[20px] border border-fire-bright/60 bg-[#3a1a10] p-[18px]"
      >
        <h2 id="call-h" className="font-display text-xl font-extrabold">In danger right now? Call first.</h2>
        <p className="text-[15px] leading-relaxed text-[#e3e9f5]">
          A report reaches the safety unit, but a phone call is faster in an emergency.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <a href="tel:112" className="btn bg-fire-bright text-[#1a0a04] hover:brightness-105">
            <Icon name="phone" size={18} /> Call 112
          </a>
          {fireUnit && (
            <a href={`tel:${fireUnit}`} className="btn btn-ghost">
              <Icon name="phone" size={18} /> Call fire unit
            </a>
          )}
        </div>
      </section>

      <ReportForm />

      {reports.length > 0 && (
        <section aria-labelledby="mine-h" className="flex flex-col gap-2.5">
          <h2 id="mine-h" className="eyebrow">Your recent reports</h2>
          <ul className="flex flex-col gap-2.5">
            {reports.map((r) => (
              <li key={r.id} className="card flex flex-col gap-1 p-4">
                <span className="flex items-center justify-between gap-3">
                  <span className="font-bold">{REPORT_LABEL[r.type]} · {r.location}</span>
                  <span className="flex-none text-[13px] text-muted">{fmtWhen(r.created_at)}</span>
                </span>
                <span className={`text-sm font-bold ${TONE[r.status]}`}>{REPORT_STATUS_LABEL[r.status]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}