import Link from "next/link";
import { requireMember } from "@/lib/auth";
import { Icon } from "@/components/icons";
import { AlertBanner } from "@/components/alert-banner";
import { signOut } from "@/app/actions";
import { fmtTime, firstName } from "@/lib/format";
import type { Alert, MusterPoint } from "@/lib/types";
import { SafeButton } from "./safe-button";
import { LinkRequests } from "./link-requests";
import { PushToggle } from "@/components/push-toggle";

type LinkRow = {
  id: string;
  status: "pending" | "approved";
  student_id: string;
  guardian_id: string;
  guardian: { full_name: string } | null;
  student: { full_name: string; matric_no: string | null } | null;
};
type AckRow = { user_id: string; safe_at: string };

export default async function MemberHome() {
  const { supabase, user, profile } = await requireMember();
  const isStudent = profile.role === "student";

  const [alertsRes, pointsRes, linksRes] = await Promise.all([
    supabase.from("alerts").select("*").eq("status", "active").order("created_at", { ascending: false }).returns<Alert[]>(),
    supabase.from("muster_points").select("*").order("sort").returns<MusterPoint[]>(),
    supabase
      .from("guardian_links")
      .select(
        "id, status, student_id, guardian_id, guardian:profiles!guardian_links_guardian_id_fkey(full_name), student:profiles!guardian_links_student_id_fkey(full_name, matric_no)",
      )
      .returns<LinkRow[]>(),
  ]);

  const alerts = alertsRes.data ?? [];
  const alert = alerts[0] ?? null;
  const allPoints = pointsRes.data ?? [];
  const points = allPoints.filter((p) => p.active);
  const links = linksRes.data ?? [];

  const acks: AckRow[] = alert
    ? ((await supabase.from("acknowledgements").select("user_id, safe_at").eq("alert_id", alert.id)).data ?? [])
    : [];

  const requests = isStudent
    ? links.filter((l) => l.student_id === user.id && l.status === "pending").map((l) => ({ id: l.id, name: l.guardian?.full_name ?? "" }))
    : [];
  const wards = !isStudent ? links.filter((l) => l.guardian_id === user.id) : [];
  const myAck = acks.find((a) => a.user_id === user.id);
    const point = alert ? allPoints.find((p) => p.id === alert.muster_point_id) : undefined;

  const wardList = wards.length > 0 && (
    <section className="card flex flex-col gap-3 p-[18px]" aria-label="Your wards">
      <h2 className="eyebrow">Your {wards.length > 1 ? "wards" : "ward"}</h2>
      {wards.map((w) => {
        const ack = acks.find((a) => a.user_id === w.student_id);
        return (
          <div key={w.id} className="flex items-center gap-3.5">
            <span className="flex size-11 flex-none items-center justify-center rounded-full bg-surface-2 font-bold text-brand-soft">
              {(w.student?.full_name || "?").slice(0, 1).toUpperCase()}
            </span>
            <span className="flex flex-1 flex-col">
              <span className="font-bold">{w.student?.full_name || "Linked student"}</span>
              {w.status === "pending" ? (
                <span className="text-[13px] text-muted">Waiting for your ward to approve</span>
              ) : alert ? (
                ack ? (
                  <span className="flex items-center gap-1.5 text-[13px] font-bold text-safe">
                    <Icon name="check" size={16} stroke={2.6} /> Marked safe at {fmtTime(ack.safe_at)}
                  </span>
                ) : (
                  <span className="text-[13px] text-[#ffc95c]">Has not confirmed yet</span>
                )
              ) : (
                <span className="text-[13px] text-muted">Linked</span>
              )}
            </span>
          </div>
        );
      })}
    </section>
  );

  if (alert) {
    return (
      <>
        <AlertBanner type={alert.type} time={fmtTime(alert.created_at)} intro={`Reported at ${alert.area}.`} />
        <div className="flex flex-1 flex-col gap-3.5 p-5">
          <section className="card flex flex-col gap-2.5 p-[18px]">
            <h2 className="eyebrow">{isStudent ? "What to do" : "What students were told"}</h2>
            <p className="text-base leading-relaxed whitespace-pre-line">{alert.instructions}</p>
          </section>

          {point && (
            <Link href="/app/muster" className="card flex items-center gap-3.5 p-4">
              <span className="flex size-11 flex-none items-center justify-center rounded-[14px] bg-surface-2 text-brand-soft">
                <Icon name="pin" size={22} />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-xs font-medium text-muted">Nearest muster point</span>
                <span className="text-lg font-bold">{point.name}</span>
                {point.description && <span className="text-sm text-muted">{point.description}</span>}
              </span>
            </Link>
          )}

          {wardList}
          <PushToggle />
          {requests.length > 0 && <LinkRequests requests={requests} />}
          {alerts.length > 1 && (
            <p className="text-center text-sm text-muted">{alerts.length - 1} other active alert{alerts.length > 2 ? "s" : ""}. See History.</p>
          )}
          <div className="flex-1" />
          {isStudent && <SafeButton alertId={alert.id} safeAt={myAck ? fmtTime(myAck.safe_at) : null} />}
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-5 pt-7">
      <header className="flex items-center justify-between">
        <span className="flex flex-col">
          <span className="text-sm text-muted">Hello</span>
          <span className="font-display text-2xl font-extrabold">{firstName(profile.full_name)}</span>
        </span>
        <form action={signOut}>
          <button type="submit" className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-bold text-muted hover:text-ink">
            <Icon name="logout" size={18} /> Sign out
          </button>
        </form>
      </header>

      <section className="flex flex-col gap-3 rounded-3xl border border-[#1f6f5c] bg-safe-bg p-[22px]">
        <span className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-safe text-safe-ink">
            <Icon name="shieldCheck" size={22} stroke={2.4} />
          </span>
          <span className="text-[13px] font-bold tracking-[0.14em] text-[#6be8c3]">CAMPUS STATUS</span>
        </span>
        <span className="font-display text-3xl leading-none font-extrabold">No active alerts</span>
        <span className="leading-relaxed text-[#b7c4db]">
          You will be notified here if an emergency is reported on campus.
        </span>
      </section>

      <Link href="/app/report" className="card flex items-center gap-3.5 p-4">
        <span className="flex size-11 flex-none items-center justify-center rounded-[14px] bg-[#3a1a10] text-[#ff8a5c]">
          <Icon name="warn" size={22} />
        </span>
        <span className="flex flex-1 flex-col">
          <span className="text-[17px] font-bold">See something? Report it</span>
          <span className="text-sm text-muted">Fire, security or medical, straight to the safety unit</span>
        </span>
      </Link>

       <PushToggle />

      {requests.length > 0 && <LinkRequests requests={requests} />}
      {wardList}

      {points.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h2 className="eyebrow">Know where to go</h2>
            <Link href="/app/muster" className="flex min-h-11 items-center text-sm font-bold text-brand-soft">See all</Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {points.slice(0, 2).map((p) => (
              <Link key={p.id} href="/app/muster" className="card flex flex-col gap-1.5 p-3.5">
                <Icon name="pin" size={22} className="text-brand-soft" />
                <span className="font-bold">{p.name}</span>
                <span className="text-[13px] text-muted">{p.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="card flex gap-3.5 p-4">
        <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-[#33290f] text-amber">
          <Icon name="clock" />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-xs font-bold tracking-[0.12em] text-[#ffc95c]">SAFETY TIP</span>
          <span className="font-bold">Know your nearest exit</span>
          <span className="text-sm leading-snug text-muted">Take 30 seconds to learn the exits in your lecture hall and hostel.</span>
        </span>
      </section>
    </div>
  );
}
