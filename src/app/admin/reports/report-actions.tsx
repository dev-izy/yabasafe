"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Icon } from "@/components/icons";
import type { ReportStatus } from "@/lib/types";
import { setReportStatus, type AdminResult } from "../actions";

export function ReportActions({ id, status, linked }: { id: string; status: ReportStatus; linked: boolean }) {
  const [state, action, pending] = useActionState<AdminResult, FormData>(setReportStatus, {});
  const small = "btn btn-ghost !min-h-11 !px-4 !text-sm";

  return (
    <div className="flex flex-col gap-3">
      {linked ? (
        <p className="flex items-center gap-2 text-sm font-bold text-[#6be8c3]">
          <Icon name="check" size={16} stroke={2.6} /> An alert was sent from this report
        </p>
      ) : (
        <Link href={`/admin/compose?report=${id}`} className="btn !min-h-12 self-start bg-fire-bright text-[#1a0a04] hover:brightness-105">
          <Icon name="send" size={18} stroke={2.4} /> Create alert from this report
        </Link>
      )}

      <form action={action} className="flex flex-wrap gap-2">
        <input type="hidden" name="id" value={id} />
        {status === "new" && (
          <button type="submit" name="status" value="acknowledged" disabled={pending} className={small}>
            Acknowledge
          </button>
        )}
        {(status === "new" || status === "acknowledged") && (
          <button type="submit" name="status" value="responding" disabled={pending} className={small}>
            Mark responding
          </button>
        )}
        <button type="submit" name="status" value="resolved" disabled={pending} className={small}>
          Resolve
        </button>
        <button type="submit" name="status" value="dismissed" disabled={pending} className={small}>
          Dismiss
        </button>
      </form>

      {state.error && (
        <p role="alert" className="text-sm text-[#ff8a5c]">
          {state.error}
        </p>
      )}
    </div>
  );
}