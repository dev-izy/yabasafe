"use client";

import { useActionState } from "react";
import { Icon } from "@/components/icons";
import { clearAlert, type AdminResult } from "../actions";

export function ClearForm({ alertId }: { alertId: string }) {
  const [state, action, pending] = useActionState<AdminResult, FormData>(clearAlert, {});
  return (
    <form action={action} className="flex flex-col gap-2.5 sm:items-end">
      <input type="hidden" name="alert_id" value={alertId} />
      <div className="flex flex-wrap gap-2.5">
        <label htmlFor={`msg-${alertId}`} className="sr-only">Optional message with the All Clear</label>
        <input
          id={`msg-${alertId}`}
          name="message"
          maxLength={300}
          placeholder="Optional message, e.g. Return to class"
          className="field !h-12 min-w-0 flex-1 !border-white/40 !bg-black/25 sm:w-72 sm:flex-none"
        />
        <button type="submit" disabled={pending} className="btn btn-safe">
          <Icon name="check" size={18} stroke={2.6} /> {pending ? "Sending…" : "Send All Clear"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg bg-black/40 px-3 py-2 text-sm">
          {state.error}
        </p>
      )}
    </form>
  );
}
