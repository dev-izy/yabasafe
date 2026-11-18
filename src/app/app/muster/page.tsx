import { requireMember } from "@/lib/auth";
import { pointLetter } from "@/lib/format";
import type { MusterPoint } from "@/lib/types";

export const metadata = { title: "Muster points · YabaSafe Alert" };

export default async function MusterPage() {
  const { supabase } = await requireMember();
  const { data } = await supabase
    .from("muster_points")
    .select("*")
    .eq("active", true)
    .order("sort")
    .returns<MusterPoint[]>();
  const points = data ?? [];

  return (
    <div className="flex flex-1 flex-col gap-5 p-5 pt-7">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold">Muster points</h1>
        <p className="text-muted">Where to gather when you are told to evacuate.</p>
      </header>
      {points.length === 0 ? (
        <p className="card p-5 text-muted">No muster points have been added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {points.map((p, i) => (
            <li key={p.id} className="card flex items-center gap-3.5 px-4 py-3.5">
              <span className="flex size-11 flex-none items-center justify-center rounded-[14px] bg-surface-2 font-display text-xl font-extrabold text-brand-soft">
                {pointLetter(p.name, i)}
              </span>
              <span className="flex flex-col">
                <span className="text-[17px] font-bold">{p.name}</span>
                <span className="text-sm text-muted">{p.description}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
