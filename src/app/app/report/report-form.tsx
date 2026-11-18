"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/icons";
import { ALERT_STYLE } from "@/lib/alert-style";
import { REPORT_LABEL, REPORT_TO_ALERT, type ReportType } from "@/lib/types";
import { createReport, type ReportResult } from "../actions";

const TYPES: ReportType[] = ["fire", "security", "medical", "other"];

export function ReportForm() {
  const [sent, setSent] = useState(false);
  const [state, action, pending] = useActionState<ReportResult, FormData>(async (prev, fd) => {
    const result = await createReport(prev, fd);
    if (result.sent) setSent(true);
    return result;
  }, {});

  if (sent) {
    return (
      <section
        role="status"
        className="flex flex-col gap-3 rounded-[20px] border border-[#1f6f5c] bg-safe-bg p-[18px]"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-safe text-safe-ink">
            <Icon name="check" size={22} stroke={2.6} />
          </span>
          <span className="font-display text-xl font-extrabold">Report sent</span>
        </span>
        <p className="text-[15px] leading-relaxed text-[#b7c4db]">
          The safety unit has it. Keep your phone with you. You can follow the status below. If things get worse, call 112.
        </p>
        <button type="button" onClick={() => setSent(false)} className="btn btn-ghost self-start">
          Report something else
        </button>
      </section>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2.5">
        <legend className="eyebrow mb-2.5">What are you reporting?</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {TYPES.map((t) => {
            const s = ALERT_STYLE[REPORT_TO_ALERT[t]];
            return (
              <label
                key={t}
                className="flex min-h-[84px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-line bg-surface text-sm font-medium text-[#e3e9f5] has-[:checked]:border-2 has-[:checked]:border-brand has-[:checked]:bg-surface-2 has-[:checked]:font-bold has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand"
              >
                <input type="radio" name="type" value={t} required className="sr-only" />
                <span style={{ color: s.tint }}>
                  <Icon name={s.icon} size={24} />
                </span>
                {REPORT_LABEL[t]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="location" className="label">Where is it?</label>
        <input
          id="location"
          name="location"
          required
          maxLength={120}
          placeholder="e.g. Engineering Block, second floor"
          className="field"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="details" className="label">What can you see? (optional)</label>
        <textarea
          id="details"
          name="details"
          rows={3}
          maxLength={500}
          placeholder="e.g. Smoke from the generator room, people are leaving"
          className="field !h-auto resize-y py-3.5 leading-relaxed"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl border border-fire-bright/50 bg-[#3a1a10] px-4 py-3 text-[15px]">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn !min-h-14 bg-fire-bright text-[#1a0a04] hover:brightness-105">
        <Icon name="send" stroke={2.4} /> {pending ? "Sending…" : "Send report"}
      </button>
    </form>
  );
}