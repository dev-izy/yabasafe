"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/app", label: "Home", icon: "home" },
    { href: "/app/report", label: "Report", icon: "warn" },
  { href: "/app/muster", label: "Muster", icon: "pin" },
  { href: "/app/history", label: "History", icon: "bell" },
];

export function MemberNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="sticky bottom-0 flex border-t border-line bg-bg px-2 pt-2 pb-5">
      {TABS.map((t) => {
        const active = path === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 text-xs ${
              active ? "font-bold text-brand-soft" : "font-medium text-muted"
            }`}
          >
            <Icon name={t.icon} size={22} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
