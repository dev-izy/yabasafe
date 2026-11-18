import { requireMember } from "@/lib/auth";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { MemberNav } from "./nav";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  await requireMember();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <RealtimeRefresh tables={["alerts", "acknowledgements", "guardian_links"]} />
      <div className="flex flex-1 flex-col">{children}</div>
      <MemberNav />
    </div>
  );
}
