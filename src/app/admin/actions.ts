"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AlertType, AudienceKind } from "@/lib/types";
import { pushNewAlert, pushAllClear } from "@/lib/push";

export type AdminResult = { error?: string };

const TYPES: AlertType[] = ["fire", "security", "medical", "general", "drill"];
const KINDS: AudienceKind[] = ["all", "department", "hostel"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Every action re-checks the role. Hiding a page is not access control.
async function staffContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single<{ role: string }>();
  if (data?.role !== "officer" && data?.role !== "admin") return null;
  return { supabase, user };
}

export async function createAlert(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  const ctx = await staffContext();
  if (!ctx) return { error: "Only safety staff can send alerts. Log in again." };

  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const type = get("type") as AlertType;
  const area = get("area");
  const instructions = get("instructions");
  const kind = get("audience_kind") as AudienceKind;
  const value = get("audience_value");
  const point = get("muster_point_id");
  const reportId = get("report_id");

  if (!TYPES.includes(type)) return { error: "Choose an emergency type." };
  if (!area) return { error: "Say which area is affected." };
  if (area.length > 120) return { error: "Keep the affected area under 120 characters." };
  if (!instructions) return { error: "Write clear instructions for people to follow." };
  if (instructions.length > 500) return { error: "Keep the instructions under 500 characters." };
  if (!KINDS.includes(kind)) return { error: "Choose who should receive this alert." };
  if (kind !== "all" && !value) return { error: "Choose the department or hostel to alert." };
  if (point && !UUID.test(point)) return { error: "That muster point is not valid." };
  if (reportId && !UUID.test(reportId)) return { error: "That report is not valid." };

  const { data: created, error } = await ctx.supabase
    .from("alerts")
    .insert({
      type,
      area,
      instructions,
      muster_point_id: point || null,
      audience_kind: kind,
      audience_value: kind === "all" ? null : value,
      created_by: ctx.user.id,
    })
    .select("id")
    .single<{ id: string }>();
  if (error || !created) return { error: "The alert was not sent. Check your connection and try again." };

  // Alert sent from a student report: link them and mark the report as being handled.
  if (reportId) {
    await ctx.supabase
      .from("incident_reports")
      .update({ linked_alert_id: created.id, handled_by: ctx.user.id })
      .eq("id", reportId);
    await ctx.supabase
      .from("incident_reports")
      .update({ status: "responding" })
      .eq("id", reportId)
      .in("status", ["new", "acknowledged"]);
    revalidatePath("/admin", "layout");
    revalidatePath("/app/report");
  }

  revalidatePath("/admin/monitor");
  redirect("/admin/monitor");
}

export async function clearAlert(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  const ctx = await staffContext();
  if (!ctx) return { error: "Only safety staff can send an All Clear. Log in again." };

  const id = String(formData.get("alert_id") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!UUID.test(id)) return { error: "That alert is not valid." };
  if (message.length > 300) return { error: "Keep the message under 300 characters." };

const { data: cleared, error } = await ctx.supabase
  .from("alerts")
  .update({ status: "cleared", cleared_at: new Date().toISOString(), clear_message: message || null })
  .eq("id", id)
  .eq("status", "active")
  .select("id, area")
  .maybeSingle<{ id: string; area: string }>();
if (error) return { error: "The All Clear was not sent. Try again." };
if (cleared) await pushAllClear({ id: cleared.id, area: cleared.area, message: message || null });

  
  await pushNewAlert({ id: created.id, type, area, instructions });
  revalidatePath("/admin/monitor");
  return {};
}

function refreshPointPages() {
  revalidatePath("/admin/points");
  revalidatePath("/admin/compose");
  revalidatePath("/app");
  revalidatePath("/app/muster");
}

export async function savePoint(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  const ctx = await staffContext();
  if (!ctx) return { error: "Only safety staff can change muster points. Log in again." };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return { error: "Give the muster point a name, e.g. Muster Point D." };
  if (name.length > 60) return { error: "Keep the name under 60 characters." };
  if (description.length > 160) return { error: "Keep the location description under 160 characters." };
  if (id && !UUID.test(id)) return { error: "That muster point is not valid." };

  if (id) {
    const { error } = await ctx.supabase.from("muster_points").update({ name, description }).eq("id", id);
    if (error) return { error: "Could not save your changes. Try again." };
  } else {
    const { data: last } = await ctx.supabase
      .from("muster_points")
      .select("sort")
      .order("sort", { ascending: false })
      .limit(1)
      .maybeSingle<{ sort: number }>();
    const { error } = await ctx.supabase
      .from("muster_points")
      .insert({ name, description, sort: (last?.sort ?? 0) + 1 });
    if (error) return { error: "Could not add the muster point. Try again." };
  }

  refreshPointPages();
  return {};
}

export async function setPointActive(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  const ctx = await staffContext();
  if (!ctx) return { error: "Only safety staff can change muster points. Log in again." };

  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!UUID.test(id)) return { error: "That muster point is not valid." };

  const { error } = await ctx.supabase.from("muster_points").update({ active }).eq("id", id);
  if (error) return { error: "Could not update the muster point. Try again." };

  refreshPointPages();
  return {};
}

const REPORT_STATUSES = ["acknowledged", "responding", "resolved", "dismissed"];

export async function setReportStatus(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  const ctx = await staffContext();
  if (!ctx) return { error: "Only safety staff can update reports. Log in again." };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!UUID.test(id)) return { error: "That report is not valid." };
  if (!REPORT_STATUSES.includes(status)) return { error: "That status is not valid." };

  const { error } = await ctx.supabase
    .from("incident_reports")
    .update({ status, handled_by: ctx.user.id })
    .eq("id", id);
  if (error) return { error: "Could not update the report. Try again." };

  revalidatePath("/admin", "layout");
  revalidatePath("/app/report");
  return {};
}

