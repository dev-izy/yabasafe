import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { Icon } from "@/components/icons";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ALERT_STYLE } from "@/lib/alert-style";
import { fmtTime, fmtWhen } from "@/lib/format";
import { ALERT_LABEL, type Alert } from "@/lib/types";
import { ClearForm } from "./clear-form";

export const metadata = { title: "Live monitor · YabaSafe" };

type Stats = { students: number; guardians: number; safe: number };
type Pending = { id: string; full_name: string; matric_no: string | null; phone: string | null };

export default async function MonitorPage() {
  const { supabase } = await requireStaff();

  const [activeRes, clearedRes] = await Promise.all([
    supabase.from("alerts").select("*").eq("status", "active").order("created_at", { ascending: false }).returns<Alert[]>(),
    supabase
      .from("alerts")
      .select("*")
      .eq("status", "cleared")
      .order("cleared_at", { ascending: false })
      .limit(5)
      .returns<Alert[]>(),
  ]);
  const active = activeRes.data ?? [];
  const cleared = clearedRes.data ?? [];

  const details = await Promise.all(
    active.map(async (a) => {
      const [statsRes, pendingRes] = await Promise.all([
        supabase.rpc("alert_stats", { p_alert: a.id }),
        supabase.rpc("alert_pending", { p_alert: a.id }),
      ]);
      const stats = ((statsRes.data as Stats[] | null) ?? [])[0] ?? { students: 0, guardians: 0, safe: 0 };
      const pending = (pendingRes.data as Pending[] | null) ?? [];
      return { alert: a, stats, pending };
    }),
  );

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <RealtimeRefresh tables={["alerts", "acknowledgements"]} />
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Live monitor</h1>
        <p className="text-muted">Updates on its own as people tap “I am Safe”.</p>
      </header>

      {details.length === 0 && (
        <section className="flex flex-col items-start gap-3 rounded-3xl border border-[#1f6f5c] bg-safe-bg p-6">
          <span className="flex size-10 items-center justify-center rounded-full bg-safe text-safe-ink">
            <Icon name="shieldCheck" size={22} stroke={2.4} />
          </span>
          <h2 className="font-display text-2xl font-extrabold">No active alerts</h2>
          <p className="text-[#b7c4db]">Everything is clear. Alerts you send will show up here with live responses.</p>
          <Link href="/admin/compose" className="btn btn-brand">
            <Icon name="plus" /> Create alert
          </Link>
        </section>
      )}

      {details.map(({ alert, stats, pending }) => {
        const s = ALERT_STYLE[alert.type];
        const pct = stats.students > 0 ? Math.round((stats.safe / stats.students) * 100) : 0;
        const waiting = Math.max(stats.students - stats.safe, 0);
        const audience =
          alert.audience_kind === "all"
            ? "All campus"
            : `${alert.audience_kind === "department" ? "Department" : "Hostel"}: ${alert.audience_value}`;
        return (
          <article key={alert.id} className="flex flex-col gap-5" aria-label={`${ALERT_LABEL[alert.type]} in ${alert.area}`}>
            <div
              role="status"
              className="flex flex-col gap-4 rounded-[20px] p-5 sm:flex-row sm:items-center sm:justify-between"
              style={{ background: s.bg, color: s.fg }}
            >
              <div className="flex items-center gap-3.5">
                <span className="flex size-12 flex-none items-center justify-center rounded-full bg-black/20">
                  <Icon name={s.icon} size={26} />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold tracking-[0.14em] uppercase">
                    Active alert · sent {fmtTime(alert.created_at)}
                  </span>
                  <span className="font-display text-2xl font-extrabold">
                    {ALERT_LABEL[alert.type]} · {alert.area}
                  </span>
                  <span className="text-sm">{audience}</span>
                </div>
              </div>
              <ClearForm alertId={alert.id} />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="card flex flex-col gap-1 p-[18px]">
                <span className="text-[13px] font-medium text-muted">Students alerted</span>
                <span className="font-display text-4xl font-extrabold">{stats.students}</span>
              </div>
              <div className="card flex flex-col gap-1 p-[18px]">
                <span className="text-[13px] font-medium text-muted">Guardians alerted</span>
                <span className="font-display text-4xl font-extrabold">{stats.guardians}</span>
              </div>
              <div className="card flex flex-col gap-1 p-[18px]">
                <span className="text-[13px] font-bold text-[#ffc95c]">Not yet confirmed</span>
                <span className="font-display text-4xl font-extrabold">{waiting}</span>
              </div>
              <div className="flex flex-col gap-1.5 rounded-[18px] border border-[#1f6f5c] bg-safe-bg p-[18px]">
                <span className="text-[13px] font-bold text-[#6be8c3]">Marked “I am Safe”</span>
                <span className="font-display text-4xl font-extrabold">{stats.safe}</span>
                <div
                  role="progressbar"
                  aria-label="Share of students marked safe"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 overflow-hidden rounded-full bg-surface-2"
                >
                  <div className="h-full bg-safe" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <span className="text-[13px] text-[#b7c4db]">{pct}% of students</span>
              </div>
            </div>

            <section aria-labelledby={`wait-${alert.id}`} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-[22px] py-[18px]">
                <h2 id={`wait-${alert.id}`} className="text-lg font-bold">Awaiting confirmation</h2>
                {waiting > pending.length && <span className="text-sm text-muted">Showing the first {pending.length}</span>}
              </div>
              {pending.length === 0 ? (
                <p className="px-[22px] py-6 text-muted">
                  {stats.students === 0 ? "No registered students are in this audience yet." : "Every student has confirmed they are safe."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-[15px]">
                    <thead>
                      <tr className="text-left text-[13px] text-muted">
                        <th scope="col" className="px-[22px] py-3 font-bold">Name</th>
                        <th scope="col" className="px-[22px] py-3 font-bold">Matric no.</th>
                        <th scope="col" className="px-[22px] py-3 font-bold">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.map((p) => (
                        <tr key={p.id} className="border-t border-line">
                          <td className="px-[22px] py-3.5 font-bold">{p.full_name || "Unnamed"}</td>
                          <td className="px-[22px] py-3.5 text-[#c5cfe3]">{p.matric_no ?? "—"}</td>
                          <td className="px-[22px] py-3.5">
                            {p.phone ? (
                              <a href={`tel:${p.phone}`} className="font-bold text-brand-soft">{p.phone}</a>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </article>
        );
      })}

      {cleared.length > 0 && (
        <section aria-labelledby="recent-h" className="flex flex-col gap-3">
          <h2 id="recent-h" className="eyebrow">Recently cleared</h2>
          <ul className="card divide-y divide-line">
            {cleared.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-[18px] py-3.5">
                <span className="flex flex-col">
                  <span className="font-bold">{ALERT_LABEL[a.type]} · {a.area}</span>
                  {a.clear_message && <span className="text-sm text-muted">{a.clear_message}</span>}
                </span>
                <span className="text-sm text-muted">Cleared {a.cleared_at ? fmtWhen(a.cleared_at) : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
