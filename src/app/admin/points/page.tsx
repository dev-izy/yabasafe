import { requireStaff } from "@/lib/auth";
import type { MusterPoint } from "@/lib/types";
import { AddPoint, PointRow } from "./points-ui";

export const metadata = { title: "Muster points · YabaSafe" };

export default async function PointsPage() {
  const { supabase } = await requireStaff();
  const { data } = await supabase.from("muster_points").select("*").order("sort").returns<MusterPoint[]>();
  const points = data ?? [];

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">Muster points</h1>
        <p className="text-muted">
          Students see these in the app and on every alert. Hide a point instead of deleting it, so old alerts still make sense.
        </p>
      </header>

      <AddPoint />

      <section aria-labelledby="all-h" className="card overflow-hidden">
        <h2 id="all-h" className="border-b border-line px-[22px] py-[18px] text-lg font-bold">All muster points</h2>
        {points.length === 0 ? (
          <p className="px-[22px] py-6 text-muted">No muster points yet. Add the first one above.</p>
        ) : (
          <ul className="divide-y divide-line">
            {points.map((p, i) => (
              <PointRow key={p.id} point={p} index={i} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}