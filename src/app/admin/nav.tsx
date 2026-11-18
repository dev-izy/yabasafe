"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, Logo, type IconName } from "@/components/icons";
import { signOut } from "@/app/actions";

const LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin/reports", label: "Incoming reports", icon: "warn" },
  { href: "/admin/compose", label: "Create alert", icon: "plus" },
  { href: "/admin/monitor", label: "Live monitor", icon: "pulse" },
  { href: "/admin/points", label: "Muster points", icon: "pin" },
];

export function AdminNav({ name, role, newReports }: { name: string; role: string; newReports: number }) {
  const path = usePathname();
  return (
    <aside className="flex flex-col gap-4 border-b border-line bg-[#0d1424] p-4 md:min-h-dvh md:w-64 md:flex-none md:gap-7 md:border-r md:border-b-0 md:px-[18px] md:py-7">
      <div className="flex items-center justify-between">
        <Logo />
        <form action={signOut} className="md:hidden">
          <button type="submit" className="flex min-h-11 cursor-pointer items-center gap-2 px-2 text-sm font-bold text-muted">
            <Icon name="logout" size={18} /> Sign out
          </button>
        </form>
      </div>

      <nav aria-label="Admin" className="flex gap-1 md:flex-col">
        {LINKS.map((l) => {
          const active = path === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 flex-1 items-center gap-3 rounded-xl px-3 text-[15px] md:flex-none ${
                active ? "bg-[#1a2848] font-bold text-white" : "font-medium text-[#b7c4db] hover:bg-surface"
              }`}
            >
              <Icon name={l.icon} className={active ? "text-[#9cc2ff]" : ""} />
              {l.label}
              {l.href === "/admin/reports" && newReports > 0 && (
                <span className="ml-auto rounded-full bg-fire-bright px-2 py-0.5 text-xs font-bold text-[#1a0a04]">
                  {newReports}
                  <span className="sr-only"> new</span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden flex-col gap-3 md:flex">
        <div className="flex items-center gap-3 rounded-[14px] border border-line p-3">
          <span className="flex size-10 flex-none items-center justify-center rounded-full bg-[#1a2848] font-bold text-[#9cc2ff]">
            {(name || "?").slice(0, 1).toUpperCase()}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold">{name || "Safety staff"}</span>
            <span className="text-xs text-muted capitalize">{role}</span>
          </span>
        </div>
        <form action={signOut}>
          <button type="submit" className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-bold text-muted hover:text-ink">
            <Icon name="logout" size={18} /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
