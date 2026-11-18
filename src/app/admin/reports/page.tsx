import { requireStaff } from "@/lib/auth";
import { Icon } from "@/components/icons";
import { ALERT_STYLE } from "@/lib/alert-style";
import { fmtWhen } from "@/lib/format";
import { REPORT_LABEL, REPORT_TO_ALERT, type IncidentReport, type ReportStatus } from "@/lib/types";
import { ReportActions } from "../../admin/reports/report-actions";

export const metadata = { title: "Incoming reports · YabaSafe" };

type Row = IncidentReport & {
  reporter: { full_name: string; phone: string | null; matric_no: string | null } | null;
};

const COLUMNS =
  "id, reporter_id, type, location, details, status, linked_alert_id, created_at, updated_at, reporter:profiles!incident_reports_reporter_id_fkey(full_name, phone, matric_no)";

const STATUS_LABEL: Record<ReportStatus, string> = {
  new: "New",
  acknowledged: "Acknowledged",
  responding: "Responding",
  resolved: "Resolved",
  dismissed: "Dismissed",
};
const STATUS_TONE: Record<ReportStatus, string> = {
  new: "bg-fire-bright text-[#1a0a04]",
  acknowledged: "bg-[#1a2848] text-[#9cc2ff]",
  responding: "bg-[#0e2a26] text-[#6be8c3]",
  resolved: "bg-surface-2 text-muted",
  dismissed: "bg-surface-2 text-muted",
};
const RANK: Record<ReportStatus, number> = { new: 0, acknowledged: 1, responding: 2, resolved: 3, dismissed: 3 };

const sameSpot = (r: Row) => `${r.type}|${r.location.trim().toLowerCase()}`;

export default async function ReportsPage() {
  const { supabase } = await requireStaff();

  const [openRes, closedRes] = await Promise.all([
    supabase
      .from("incident_reports")
      .select(COLUMNS)
      .in("status", ["new", "acknowledged", "responding"])
      .order("created_at", { ascending: false })
      .returns<Row[]>(),
    supabase
      .from("incident_reports")
      .select(COLUMNS)
      .in("status", ["resolved", "dismissed"])
      .order("updated_at", { ascending: false })
      .limit(8)
      .returns<Row[]>(),
  ]);

  const open = [...(openRes.data ?? [])].sort((a, b) => RANK[a.status] - RANK[b.status]);
  const closed = closedRes.data ?? [];

  // People who reported the same kind of incident at the same place.
  const reporters = new Map<string, Set<string>>();
  for (const r of open) {
    const key = sameSpot(r);
    reporters.set(key, (reporters.get(key) ?? new Set()).add(r.reporter_id));
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Incoming reports</h1>
        <p className="text-muted">
          Reports from students and guardians. Nothing is sent to the campus until you create an alert.
        </p>
      </header>

      {open.length === 0 && (
        <section className="flex flex-col items-start gap-3 rounded-3xl border border-[#1f6f5c] bg-safe-bg p-6">
          <span className="flex size-10 items-center justify-center rounded-full bg-safe text-safe-ink">
            <Icon name="shieldCheck" size={22} stroke={2.4} />
          </span>
          <h2 className="font-display text-2xl font-extrabold">No open reports</h2>
          <p className="text-[#b7c4db]">New reports appear here instantly and light up the badge in the sidebar.</p>
        </section>
      )}

      <ul className="flex flex-col gap-4">
        {open.map((r) => {
          const s = ALERT_STYLE[REPORT_TO_ALERT[r.type]];
          const people = reporters.get(sameSpot(r))?.size ?? 1;
          return (
            <li
              key={r.id}
              className={`card flex flex-col gap-4 p-5 ${r.status === "new" ? "!border-fire-bright/70" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold"
                  style={{ background: s.soft, color: s.tint }}
                >
                  <Icon name={s.icon} size={18} /> {REPORT_LABEL[r.type]}
                </span>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_TONE[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
                {people > 1 && (
                  <span className="rounded-full bg-[#33290f] px-3 py-1.5 text-xs font-bold text-[#ffc95c]">
                    {people} people reported this
                  </span>
                )}
                <span className="ml-auto text-sm text-muted">{fmtWhen(r.created_at)}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="font-display text-2xl font-extrabold">{r.location}</h2>
                {r.details && <p className="leading-relaxed whitespace-pre-line text-[#e3e9f5]">{r.details}</p>}
              </div>

              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-[#b7c4db]">
                <span>
                  Reported by <b className="text-ink">{r.reporter?.full_name || "Unknown"}</b>
                  {r.reporter?.matric_no ? ` · ${r.reporter.matric_no}` : ""}
                </span>
                {r.reporter?.phone && (
                  <a href={`tel:${r.reporter.phone}`} className="flex min-h-11 items-center gap-1.5 font-bold text-brand-soft">
                    <Icon name="phone" size={16} /> {r.reporter.phone}
                  </a>
                )}
              </p>

              <ReportActions id={r.id} status={r.status} linked={!!r.linked_alert_id} />
            </li>
          );
        })}
      </ul>

      {closed.length > 0 && (
        <section aria-labelledby="closed-h" className="flex flex-col gap-3">
          <h2 id="closed-h" className="eyebrow">Recently closed</h2>
          <ul className="card divide-y divide-line">
            {closed.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-[18px] py-3.5">
                <span className="font-bold">{REPORT_LABEL[r.type]} · {r.location}</span>
                <span className="text-sm text-muted">
                  {STATUS_LABEL[r.status]} {fmtWhen(r.updated_at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}