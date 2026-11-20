"use server";

import { createClient } from "@/lib/supabase/server";

type Sub = { endpoint: string; p256dh: string; auth: string; ua?: string };

export async function savePushSubscription(sub: Sub): Promise<{ error?: string }> {
  if (!sub?.endpoint?.startsWith("https://") || !sub.p256dh || !sub.auth) return { error: "Invalid subscription." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("register_push", {
    p_endpoint: sub.endpoint,
    p_p256dh: sub.p256dh,
    p_auth: sub.auth,
    p_ua: (sub.ua ?? "").slice(0, 300),
  });
  return error ? { error: "Could not turn on notifications. Try again." } : {};
}

export async function removePushSubscription(endpoint: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return error ? { error: "Could not turn off notifications." } : {};
}