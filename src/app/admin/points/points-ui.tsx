"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/icons";
import { pointLetter } from "@/lib/format";
import type { MusterPoint } from "@/lib/types";
import { savePoint, setPointActive, type AdminResult } from "../actions";

function PointForm({ point, onDone, onCancel }: { point?: MusterPoint; onDone: () => void; onCancel?: () => void }) {
  const [state, action, pending] = useActionState<AdminResult, FormData>(async (prev, fd) => {
    const result = await savePoint(prev, fd);
    if (!result.error) onDone();
    return result;
  }, {});
  const uid = point?.id ?? "new";

  return (
    <form action={action} className="flex flex-col gap-3.5">
      {point && <input type="hidden" name="id" value={point.id} />}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`name-${uid}`} className="label">Name</label>
        <input
          id={`name-${uid}`}
          name="name"
          required
          maxLength={60}
          defaultValue={point?.name ?? ""}
          placeholder="e.g. Muster Point D"
          className="field"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`desc-${uid}`} className="label">Simple location description</label>
        <input
          id={`desc-${uid}`}
          name="description"
          maxLength={160}
          defaultValue={point?.description ?? ""}
          placeholder="e.g. Open ground beside the Library"
          className="field"
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl border border-fire-bright/50 bg-[#3a1a10] px-4 py-3 text-[15px]">
          {state.error}
        </p>
      )}
      <div className="flex gap-2.5">
        <button type="submit" disabled={pending} className="btn btn-brand">
          {pending ? "Saving…" : point ? "Save changes" : "Add muster point"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={pending} className="btn btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function AddPoint() {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-brand self-start">
        <Icon name="plus" size={18} stroke={2.6} /> Add muster point
      </button>
    );
  }
  return (
    <section aria-label="Add muster point" className="card p-5">
      <PointForm onDone={() => setOpen(false)} onCancel={() => setOpen(false)} />
    </section>
  );
}

export function PointRow({ point, index }: { point: MusterPoint; index: number }) {
  const [editing, setEditing] = useState(false);
  const [state, toggle, pending] = useActionState<AdminResult, FormData>(setPointActive, {});

  if (editing) {
    return (
      <li className="bg-surface-2/40 p-5">
        <PointForm point={point} onDone={() => setEditing(false)} onCancel={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 px-[22px] py-4">
      <span
        className={`flex size-11 flex-none items-center justify-center rounded-[14px] font-display text-xl font-extrabold ${
          point.active ? "bg-brand text-brand-ink" : "bg-surface-2 text-muted"
        }`}
      >
        {pointLetter(point.name, index)}
      </span>
      <span className="flex min-w-0 flex-1 basis-48 flex-col">
        <span className={`text-base font-bold ${point.active ? "" : "text-muted"}`}>{point.name}</span>
        <span className="text-sm text-muted">{point.description || "No description"}</span>
      </span>
      <span className={`text-xs font-bold ${point.active ? "text-[#6be8c3]" : "text-[#ffc95c]"}`}>
        {point.active ? "Shown to students" : "Hidden"}
      </span>
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditing(true)} className="btn btn-ghost !min-h-11 !px-4 !text-sm">
          Edit
        </button>
        <form action={toggle}>
          <input type="hidden" name="id" value={point.id} />
          <input type="hidden" name="active" value={String(!point.active)} />
          <button type="submit" disabled={pending} className="btn btn-ghost !min-h-11 !px-4 !text-sm">
            {point.active ? "Hide" : "Show"}
          </button>
        </form>
      </div>
      {state.error && (
        <p role="alert" className="basis-full text-sm text-[#ff8a5c]">
          {state.error}
        </p>
      )}
    </li>
  );
}