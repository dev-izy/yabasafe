"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const { error } = await createClient().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
    router.replace(safeNext);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold">Welcome back</h1>
        <p className="text-muted">Log in to receive alerts, or to manage them if you are with the Safety Unit.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="field" placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>
      {error && (
        <p role="alert" className="rounded-xl border border-fire-bright/50 bg-[#3a1a10] px-4 py-3 text-[15px]">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="btn btn-brand !min-h-14">
        {busy ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-[15px] text-muted">
        New here?{" "}
        <Link href="/register" className="font-bold text-brand-soft">Create an account</Link>
      </p>
    </form>
  );
}
