"use client";

import { useActionState, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { ALERT_LABEL, ALERT_HEADLINE, type AlertType, type AudienceKind, type MusterPoint } from "@/lib/types";
import { ALERT_STYLE } from "@/lib/alert-style";
import { createAlert, type AdminResult } from "../actions";

const TYPES: AlertType[] = ["fire", "security", "medical", "general", "drill"];
const SHORT: Record<AlertType, string> = {
  fire: "Fire",
  security: "Security",
  medical: "Medical",
  general: "General",
  drill: "Fire drill",
};
const SMS_LIMIT = 160;

export function ComposeForm({
  points,
  departments,
  hostels,
  initial,
}: {
  points: MusterPoint[];
  departments: string[];
  hostels: string[];
  initial?: { reportId: string; type: AlertType; area: string; details: string };
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<AdminResult, FormData>(createAlert, {});
  const [type, setType] = useState<AlertType>(initial?.type ?? "fire");
  const [area, setArea] = useState(initial?.area ?? "");
  const [kind, setKind] = useState<AudienceKind>("all");
  const [value, setValue] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pointId, setPointId] = useState(points[0]?.id ?? "");
  const [reviewing, setReviewing] = useState(false);

  const style = ALERT_STYLE[type];
  const options = kind === "department" ? departments : kind === "hostel" ? hostels : [];
  const point = points.find((p) => p.id === pointId);
  const audienceText = kind === "all" ? "All campus" : value ? `${kind === "department" ? "Department" : "Hostel"}: ${value}` : "";
  const sms = `YABASAFE ${ALERT_LABEL[type].toUpperCase()}: ${instructions || "…"}`;
  const smsParts = Math.max(1, Math.ceil(sms.length / SMS_LIMIT));

  function review() {
    if (formRef.current?.reportValidity()) setReviewing(true);
  }

  return (
    <form ref={formRef} action={action} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-7">
                {initial && (
          <p className="card flex gap-3 p-4 text-[15px] leading-relaxed">
            <Icon name="warn" className="mt-0.5 flex-none text-[#ffc95c]" />
            <span>
              Based on a student report{initial.details ? `: “${initial.details}”` : "."} Check it before you send.
            </span>
          </p>
        )}
        <input type="hidden" name="report_id" value={initial?.reportId ?? ""} />
        <fieldset className="flex flex-col gap-2.5">
          <legend className="eyebrow mb-2.5">1 · Emergency type</legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {TYPES.map((t) => {
              const on = t === type;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setType(t)}
                  className={`flex min-h-[84px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border text-sm ${
                    on ? "border-2 font-bold text-white" : "border-line bg-surface font-medium text-[#e3e9f5]"
                  }`}
                  style={on ? { background: ALERT_STYLE[t].soft, borderColor: ALERT_STYLE[t].tint } : undefined}
                >
                  <span style={{ color: ALERT_STYLE[t].tint }}>
                    <Icon name={ALERT_STYLE[t].icon} size={24} />
                  </span>
                  {SHORT[t]}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="type" value={type} />
        </fieldset>

        <fieldset className="flex flex-col gap-3.5">
          <legend className="eyebrow mb-2.5">2 · Area and audience</legend>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="area" className="label">Affected area</label>
              <input
                id="area"
                name="area"
                required
                maxLength={120}
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Engineering Block"
                className="field"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="audience_kind" className="label">Send to</label>
              <select
                id="audience_kind"
                name="audience_kind"
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value as AudienceKind);
                  setValue("");
                }}
                className="field"
              >
                <option value="all">All campus</option>
                <option value="department">A specific department</option>
                <option value="hostel">A specific hostel</option>
              </select>
            </div>
          </div>

          {kind !== "all" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="audience_value" className="label">{kind === "department" ? "Department" : "Hostel"}</label>
              <select
                id="audience_value"
                name="audience_value"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="field"
              >
                <option value="">{options.length ? "Choose one…" : "No registered students have this yet"}</option>
                {options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          )}
          <p className="flex items-center gap-2.5 text-sm text-[#b7c4db]">
            <Icon name="users" size={18} className="flex-none text-brand-soft" />
            Reaches the selected students and their linked guardians.
          </p>
        </fieldset>

        <fieldset className="flex flex-col gap-3.5">
          <legend className="eyebrow mb-2.5">3 · What to do</legend>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="instructions" className="label">Clear instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              required
              rows={4}
              maxLength={500}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Evacuate immediately to Muster Point A near the Library. Do not use the lifts."
              className="field !h-auto resize-y py-3.5 leading-relaxed"
            />
            <span className="text-right text-xs text-muted">{instructions.length} / 500</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="muster_point_id" className="label">Nearest muster point</label>
            <select
              id="muster_point_id"
              name="muster_point_id"
              value={pointId}
              onChange={(e) => setPointId(e.target.value)}
              className="field"
            >
              <option value="">None for this alert</option>
              {points.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.description ? ` · ${p.description}` : ""}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {state.error && (
          <p role="alert" className="rounded-xl border border-fire-bright/50 bg-[#3a1a10] px-4 py-3 text-[15px]">
            {state.error}
          </p>
        )}

        {!reviewing ? (
          <div className="flex flex-wrap items-center gap-4 border-t border-line pt-5">
            <button type="button" onClick={review} className="btn !min-h-14 bg-fire-bright text-[#1a0a04] hover:brightness-105">
              <Icon name="send" stroke={2.4} /> Review and send alert
            </button>
          </div>
        ) : (
          <section
            aria-labelledby="confirm-h"
            className="flex flex-col gap-4 rounded-[20px] border-2 p-5"
            style={{ borderColor: style.tint, background: style.soft }}
          >
            <h2 id="confirm-h" className="font-display text-xl font-extrabold">Send this alert now?</h2>
            <dl className="grid gap-x-4 gap-y-1.5 text-[15px] sm:grid-cols-[110px_1fr]">
              <dt className="text-muted">Type</dt>
              <dd className="font-bold">{ALERT_LABEL[type]}</dd>
              <dt className="text-muted">Area</dt>
              <dd className="font-bold">{area}</dd>
              <dt className="text-muted">Audience</dt>
              <dd className="font-bold">{audienceText}</dd>
              <dt className="text-muted">Muster point</dt>
              <dd className="font-bold">{point?.name ?? "None"}</dd>
            </dl>
            <p className="text-sm text-[#e3e9f5]">Everyone in the audience sees this immediately. It cannot be unsent, only cleared.</p>
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={pending} className="btn !min-h-14 bg-fire-bright text-[#1a0a04] hover:brightness-105">
                <Icon name="send" stroke={2.4} /> {pending ? "Sending…" : "Send alert"}
              </button>
              <button type="button" onClick={() => setReviewing(false)} disabled={pending} className="btn btn-ghost !min-h-14">
                Back to edit
              </button>
            </div>
          </section>
        )}
      </div>

      <aside aria-label="Preview" className="flex flex-col gap-4">
        <h2 className="eyebrow">Preview</h2>
        <div className="card flex flex-col gap-3 p-[18px]">
          <span className="text-xs font-bold tracking-[0.12em] text-muted">APP ALERT</span>
          <div className="flex flex-col gap-1 rounded-2xl px-4 py-3.5" style={{ background: style.bg, color: style.fg }}>
            <span className="text-xs font-bold tracking-[0.14em] uppercase">{ALERT_LABEL[type]} · now</span>
            <span className="text-[17px] font-bold">{ALERT_HEADLINE[type]} {area}</span>
            <span className="text-sm leading-snug whitespace-pre-line">{instructions || "Your instructions appear here."}</span>
          </div>
          {point && (
            <span className="flex items-center gap-2 text-sm text-[#b7c4db]">
              <Icon name="pin" size={18} className="text-brand-soft" /> {point.name}
              {point.description ? ` · ${point.description}` : ""}
            </span>
          )}
        </div>

        <div className="card flex flex-col gap-3 p-[18px]">
          <span className="text-xs font-bold tracking-[0.12em] text-muted">SMS BACKUP</span>
          <p className="rounded-2xl bg-surface-2 px-4 py-3.5 text-[15px] leading-relaxed break-words text-[#e3e9f5]">{sms}</p>
          <span className={`text-[13px] ${smsParts > 1 ? "font-bold text-[#ffc95c]" : "text-muted"}`}>
            {sms.length} characters · {smsParts > 1 ? `sends as ${smsParts} SMS. Shorten it to fit one.` : "fits one SMS"}
          </span>
        </div>
      </aside>
    </form>
  );
}
