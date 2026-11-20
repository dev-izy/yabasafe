"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pushStaffReport } from "@/lib/push";

export type ActionResult = { error?: string };

export async function markSafe(alertId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are signed out. Log in again." };

  const { error } = await supabase
    .from("acknowledgements")
    .upsert({ alert_id: alertId, user_id: user.id }, { onConflict: "alert_id,user_id", ignoreDuplicates: true });
  if (error) return { error: "Could not send your confirmation. Try again." };
  revalidatePath("/app");
  return {};
}

export async function undoSafe(alertId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are signed out. Log in again." };

  const { error } = await supabase.from("acknowledgements").delete().eq("alert_id", alertId).eq("user_id", user.id);
  if (error) return { error: "Could not undo. Try again." };
  revalidatePath("/app");
  return {};
}

export type ReportResult = { error?: string; sent?: boolean };

const REPORT_TYPES = ["fire", "security", "medical", "other"];

export async function createReport(_prev: ReportResult, formData: FormData): Promise<ReportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are signed out. Log in again." };

  const type = String(formData.get("type") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  if (!REPORT_TYPES.includes(type)) return { error: "Choose what you are reporting." };
  if (!location) return { error: "Say where it is, so help can find it." };
  if (location.length > 120) return { error: "Keep the location under 120 characters." };
  if (details.length > 500) return { error: "Keep the details under 500 characters." };

  const { error } = await supabase.from("incident_reports").insert({ reporter_id: user.id, type, location, details });
  if (error) {
    if (error.message.includes("rate_limited")) {
      return { error: "You have sent several reports in a short time. If this is urgent, call 112 or the fire unit now." };
    }
    return { error: "Your report was not sent. If this is urgent, call 112 now." };
  }
  
  await pushStaffReport({ type, location });
  revalidatePath("/app/report");
  return { sent: true };
}

export async function respondToLink(linkId: string, approve: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = approve
    ? await supabase.from("guardian_links").update({ status: "approved" }).eq("id", linkId)
    : await supabase.from("guardian_links").delete().eq("id", linkId);
  if (error) return { error: "Something went wrong. Try again." };
  revalidatePath("/app");
  return {};
}


