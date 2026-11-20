"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { savePushSubscription, removePushSubscription } from "@/app/push-actions";

type Status = "loading" | "unsupported" | "ios-install" | "blocked" | "off" | "on";

function toKey(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function PushToggle({ label = "Get alerts on this phone" }: { label?: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !vapid) {
        setStatus(ios && !standalone ? "ios-install" : "unsupported");
        return;
      }
      if (Notification.permission === "denied") return setStatus("blocked");
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription();
        if (sub && Notification.permission === "granted") {
          const j = sub.toJSON();
          await savePushSubscription({ endpoint: sub.endpoint, p256dh: j.keys?.p256dh ?? "", auth: j.keys?.auth ?? "", ua: navigator.userAgent });
          setStatus("on");
        } else setStatus("off");
      } catch {
        setStatus("unsupported");
      }
    })();
  }, [vapid]);

  async function enable() {
    setBusy(true);
    setError("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "blocked" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(vapid!) }));
      const j = sub.toJSON();
      const res = await savePushSubscription({ endpoint: sub.endpoint, p256dh: j.keys?.p256dh ?? "", auth: j.keys?.auth ?? "", ua: navigator.userAgent });
      if (res.error) setError(res.error);
      else setStatus("on");
    } catch {
      setError("Could not turn on notifications on this device.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="card flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <Icon name="phone" className="flex-none text-brand-soft" />
        <div className="flex-1">
          <p className="font-bold">{status === "on" ? "Alerts are on for this phone" : label}</p>
          <p className="text-sm text-muted">
            {status === "on" && "You will be notified even when the app is closed."}
            {status === "off" && "Get a notification the moment an alert is sent, even when the app is closed."}
            {status === "blocked" && "Notifications are blocked. Allow them for this site in your browser settings, then reload."}
            {status === "ios-install" && "On iPhone: tap Share, choose Add to Home Screen, then open YabaSafe from your home screen and turn this on."}
            {status === "unsupported" && "This browser does not support notifications. Keep the app open to see alerts."}
          </p>
        </div>
        {status === "off" && (
          <button type="button" onClick={enable} disabled={busy} className="btn btn-brand">
            {busy ? "Turning on…" : "Turn on"}
          </button>
        )}
        {status === "on" && (
          <button type="button" onClick={disable} disabled={busy} className="btn btn-ghost">
            Turn off
          </button>
        )}
      </div>
      {error && <p role="alert" className="text-sm text-[#ffb59a]">{error}</p>}
    </div>
  );
}