import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, matric_no, department, hostel, phone")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile) redirect("/login");

  return { supabase, user, profile };
}

export async function requireStaff() {
  const ctx = await getSessionProfile();
  if (ctx.profile.role !== "officer" && ctx.profile.role !== "admin") redirect("/app");
  return ctx;
}

export async function requireMember() {
  const ctx = await getSessionProfile();
  if (ctx.profile.role === "officer" || ctx.profile.role === "admin") redirect("/admin/compose");
  return ctx;
}
