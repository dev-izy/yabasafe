import { requireMember } from "@/lib/auth";
import { Icon } from "@/components/icons";
import { fmtTime, fmtWhen } from "@/lib/format";
import { ALERT_LABEL, type Alert } from "@/lib/types";
import { ALERT_STYLE } from "@/lib/alert-style";

export const metadata = { title: "History · YabaSafe Alert" };

type Entry = { key: string; at: string; kind: "alert" | "clear"; alert: Alert };

export default async function HistoryPage() {
  const { supabase, user, profile } = await requireMember();
  const [alertsRes, acksRes] = await Promise.all([
    supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(30).returns<Alert[]>(),
    supabase.from("acknowledgements").select("alert_id, safe_at").eq("user_id", user.id),
  ]);

  const acks = new Map((acksRes.data ?? []).map((a) => [a.alert_id as string, a.safe_at as string]));
  const entries: Entry[] = [];
  for (const a of alertsRes.data ?? []) {
    entries.push({ key: a.id, at: a.created_at, kind: "alert", alert: a });
    if (a.cleared_at) entries.push({ key: `${a.id}-clear`, at: a.cleared_at, kind: "clear", alert: a });
  }
  entries.sort((x, y) => (x.at < y.at ? 1 : -1));

  return (
    <div className="flex flex-1 flex-col gap-4 p-5 pt-7">
      <h1 className="font-display text-3xl font-extrabold">History</h1>
      {entries.length === 0 ? (
        <p className="card p-5 text-muted">No alerts yet. Emergency alerts will be listed here.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {entries.map((e) => {
            const s = ALERT_STYLE[e.alert.type];
            const clear = e.kind === "clear";
            const safeAt = acks.get(e.alert.id);
            return (
              <li key={e.key} className="card flex items-start gap-3.5 px-4 py-3.5">
                <span
                  className="flex size-10 flex-none items-center justify-center rounded-full"
                  style={clear ? { background: "#0E2A26", color: "#35D6A4" } : { background: s.soft, color: s.tint }}
                >
                  <Icon name={clear ? "check" : s.icon} stroke={clear ? 2.4 : 2} />
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-base font-bold">{clear ? "All Clear" : ALERT_LABEL[e.alert.type]}</span>
                    <span className="text-[13px] text-muted">{fmtWhen(e.at)}</span>
                  </span>
                  <span className="text-sm leading-snug text-[#b7c4db] whitespace-pre-line">
                    {clear
                      ? (e.alert.clear_message || `The emergency at ${e.alert.area} is over. You may return to normal activities.`)
                      : e.alert.instructions}
                  </span>
                  {!clear && profile.role === "student" && safeAt && (
                    <span className="mt-1 text-[13px] font-bold text-safe">You marked safe at {fmtTime(safeAt)}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
