"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { markSafe, undoSafe } from "./actions";

export function SafeButton({ alertId, safeAt }: { alertId: string; safeAt: string | null }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: (id: string) => Promise<{ error?: string }>) {
    setError(null);
    start(async () => {
      const res = await fn(alertId);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {safeAt ? (
        <div className="flex items-center gap-3.5 rounded-[18px] border border-safe bg-safe-bg p-4">
          <span className="flex size-11 flex-none items-center justify-center rounded-full bg-safe text-safe-ink">
            <Icon name="check" size={24} stroke={2.6} />
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-[17px] font-bold">You are marked safe</span>
            <span className="text-[13px] text-[#b7c4db]">Sent to the Safety Unit at {safeAt}</span>
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(undoSafe)}
            className="min-h-11 cursor-pointer px-2 text-sm font-bold text-brand-soft disabled:opacity-60"
          >
            Undo
          </button>
        </div>
      ) : (
        <>
          <button type="button" disabled={pending} onClick={() => run(markSafe)} className="btn btn-safe !min-h-16 w-full !rounded-[18px] text-xl">
            <Icon name="check" size={24} stroke={2.6} />
            {pending ? "Sending…" : "I am Safe"}
          </button>
          <p className="text-center text-[13px] text-muted">
            Tap once you have reached safety. The Safety Unit and your linked guardians can see it.
          </p>
        </>
      )}
      {error && (
        <p role="alert" className="text-center text-sm text-fire-bright">
          {error}
        </p>
      )}
    </div>
  );
}
