import "server-only";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALERT_LABEL, ALERT_HEADLINE, type AlertType } from "@/lib/types";

type Target = { endpoint: string; p256dh: string; auth_key: string };
type Payload = { title: string; body: string; url: string; tag?: string; urgent?: boolean };

let configured = false;
function configure() {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

// Sends to every target. Never throws: a push failure must not break sending the alert itself.
async function deliver(targets: Target[], payload: Payload) {
  const admin = createAdminClient();
  if (!admin || !configure() || targets.length === 0) return;

  const body = JSON.stringify(payload);
  const dead: string[] = [];

  for (let i = 0; i < targets.length; i += 50) {
    await Promise.all(
      targets.slice(i, i + 50).map(async (t) => {
        try {
          await webpush.sendNotification(
            { endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth_key } },
            body,
            { TTL: 3600, urgency: payload.urgent ? "high" : "normal" },
          );
        } catch (err) {
          const code = (err as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) dead.push(t.endpoint); // device unsubscribed
        }
      }),
    );
  }

  if (dead.length) await admin.from("push_subscriptions").delete().in("endpoint", dead);
}

async function targetsFor(rpc: "push_targets_for_alert" | "push_targets_staff", args?: Record<string, string>) {
  const admin = createAdminClient();
  if (!admin) return [];
  const { data } = await admin.rpc(rpc, args);
  return (data ?? []) as Target[];
}

function clip(text: string, n: number) {
  return text.length > n ? `${text.slice(0, n - 1)}…` : text;
}

export async function pushNewAlert(a: { id: string; type: AlertType; area: string; instructions: string }) {
  try {
    const targets = await targetsFor("push_targets_for_alert", { p_alert: a.id });
    await deliver(targets, {
      title: `${a.type === "drill" ? "" : "⚠ "}${ALERT_LABEL[a.type]}: ${ALERT_HEADLINE[a.type]} ${a.area}`.trim(),
      body: clip(a.instructions, 180),
      url: "/app",
      tag: `alert-${a.id}`,
      urgent: a.type !== "drill",
    });
  } catch {
    // ignore
  }
}

export async function pushAllClear(a: { id: string; area: string; message?: string | null }) {
  try {
    const targets = await targetsFor("push_targets_for_alert", { p_alert: a.id });
    await deliver(targets, {
      title: `All Clear: ${a.area}`,
      body: a.message ? clip(a.message, 180) : "The emergency is over. You can return to normal activity.",
      url: "/app",
      tag: `alert-${a.id}`, // replaces the earlier alert notification
    });
  } catch {
    // ignore
  }
}

export async function pushStaffReport(r: { type: string; location: string }) {
  try {
    const targets = await targetsFor("push_targets_staff");
    await deliver(targets, {
      title: `New incident report: ${r.type}`,
      body: clip(r.location, 120),
      url: "/admin/reports",
      tag: "incoming-report",
      urgent: true,
    });
  } catch {
    // ignore
  }
}