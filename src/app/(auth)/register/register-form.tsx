"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/icons";

type Who = "student" | "guardian";

function Field({
  id,
  label,
  type = "text",
  placeholder,
  required = true,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label">
        {label}
        {!required && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      <input id={id} name={id} type={type} required={required} placeholder={placeholder} autoComplete={autoComplete} className="field" />
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [who, setWho] = useState<Who>("student");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "").trim();

    const { data, error } = await createClient().auth.signUp({
      email: get("email"),
      password: String(f.get("password")),
      options: {
        data: {
          role: who,
          full_name: get("full_name"),
          phone: get("phone"),
          ...(who === "student"
            ? { matric_no: get("matric_no"), department: get("department"), hostel: get("hostel") }
            : { ward_matric_no: get("ward_matric_no") }),
        },
      },
    });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    if (data.session) {
      router.replace("/app");
      router.refresh();
    } else {
      setCheckEmail(true);
      setBusy(false);
    }
  }

  if (checkEmail) {
    return (
      <div className="card flex flex-col gap-3 p-6">
        <span className="flex size-11 items-center justify-center rounded-full bg-safe text-safe-ink">
          <Icon name="check" size={24} stroke={2.6} />
        </span>
        <h1 className="font-display text-2xl font-extrabold">Check your email</h1>
        <p className="text-muted">We sent a confirmation link. Open it, then log in to start receiving alerts.</p>
        <Link href="/login" className="btn btn-brand mt-2">Go to log in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h1 className="font-display text-3xl font-extrabold">Get campus alerts the moment they matter.</h1>

      <div role="group" aria-label="I am a" className="flex gap-1 rounded-[14px] border border-line bg-surface p-1">
        {(["student", "guardian"] as const).map((w) => (
          <button
            key={w}
            type="button"
            aria-pressed={who === w}
            onClick={() => setWho(w)}
            className={`min-h-11 flex-1 cursor-pointer rounded-[10px] text-[15px] font-bold ${
              who === w ? "bg-brand text-brand-ink" : "text-[#c5cfe3]"
            }`}
          >
            {w === "student" ? "Student" : "Parent / Guardian"}
          </button>
        ))}
      </div>

      <Field id="full_name" label={who === "student" ? "Full name" : "Your full name"} autoComplete="name" />
      {who === "student" ? (
        <>
          <Field id="matric_no" label="Matriculation number" />
          <Field id="department" label="Department" />
          <Field id="hostel" label="Hostel" required={false} />
        </>
      ) : (
        <Field id="ward_matric_no" label="Your ward's matriculation number" />
      )}
      <Field id="phone" label="Phone number (for SMS backup)" type="tel" autoComplete="tel" placeholder="080 0000 0000" />
      <Field id="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" />
      <Field id="password" label="Password" type="password" autoComplete="new-password" />

      {who === "guardian" && (
        <p className="card flex gap-3 p-4 text-sm leading-relaxed text-[#c5cfe3]">
          <Icon name="shield" className="mt-0.5 flex-none text-brand-soft" />
          To protect students, your ward must approve the link in their app before you receive their alerts.
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-fire-bright/50 bg-[#3a1a10] px-4 py-3 text-[15px]">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn-brand !min-h-14">
        {busy ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-[15px] text-muted">
        Already registered? <Link href="/login" className="font-bold text-brand-soft">Log in</Link>
      </p>
    </form>
  );
}
