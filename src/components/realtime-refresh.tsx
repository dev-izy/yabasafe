"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Re-renders the current server page whenever the given tables change.
 * A slow poll backs this up, because a dropped socket must never hide an alert.
 */
export function RealtimeRefresh({ tables }: { tables: string[] }) {
  const router = useRouter();
  const key = tables.join(",");

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`rt-${key}`);
    key.split(",").forEach((table) => {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => router.refresh());
    });
    channel.subscribe();
    const poll = setInterval(() => router.refresh(), 20000);
    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [key, router]);

  return null;
}
