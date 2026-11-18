"use client";

import { useState, useTransition } from "react";
import { respondToLink } from "./actions";

export type LinkRequest = { id: string; name: string };

export function LinkRequests({ requests }: { requests: LinkRequest[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function respond(id: string, approve: boolean) {
    setError(null);
    start(async () => {
      const res = await respondToLink(id, approve);
      if (res.error) setError(res.error);
    });
  }

  return (
    <section aria-label="Guardian requests" className="flex flex-col gap-2.5">
      {requests.map((r) => (
        <div key={r.id} className="card flex flex-col gap-3 p-4">
          <p className="text-[15px] leading-snug">
            <span className="font-bold">{r.name || "A guardian"}</span> asked to receive your emergency alerts. Only approve
            people you know.
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={pending} onClick={() => respond(r.id, true)} className="btn btn-brand !min-h-11 flex-1 text-[15px]">
              Approve
            </button>
            <button type="button" disabled={pending} onClick={() => respond(r.id, false)} className="btn btn-ghost !min-h-11 flex-1 text-[15px]">
              Decline
            </button>
          </div>
        </div>
      ))}
      {error && <p role="alert" className="text-sm text-fire-bright">{error}</p>}
    </section>
  );
}
