import Link from "next/link";
import { Icon, Logo, type IconName } from "@/components/icons";

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: "pulse", title: "An emergency is reported", body: "The Safety / Fire Unit logs in and picks the emergency type and the affected area." },
  { icon: "send", title: "One alert reaches everyone", body: "Students and their linked guardians get a push notification, with SMS as a backup." },
  { icon: "shieldCheck", title: "People confirm they are safe", body: "Users tap “I am Safe”. The Unit watches responses live and sends an All Clear." },
];

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: "list", title: "Clear instructions", body: "Every alert says what to do, not just what happened." },
  { icon: "pin", title: "Muster points", body: "The nearest assembly point is shown with each alert and saved on the phone." },
  { icon: "users", title: "Guardians included", body: "Parents receive the same alert, once their ward approves the link." },
  { icon: "sms", title: "SMS backup", body: "Critical alerts still arrive when data is down." },
  { icon: "bell", title: "Targeted audiences", body: "Alert the whole campus, one department, or one hostel." },
  { icon: "list", title: "Digital record", body: "Every alert and response is logged for review and compliance." },
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="flex items-center gap-2" aria-label="Account">
          <Link href="/login" className="btn btn-ghost !min-h-11 !px-4 text-[15px]">Log in</Link>
          <Link href="/register" className="btn btn-brand !min-h-11 !px-4 text-[15px]">Register</Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-10 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
          <div className="flex flex-col gap-6">
            <span className="eyebrow">Yaba College of Technology</span>
            <h1 className="font-display text-[40px] leading-[1.02] font-extrabold tracking-tight sm:text-6xl">
              When something happens on campus, everyone knows what to do.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              YabaSafe Alert sends real-time emergency notifications to students and guardians, with clear instructions
              and the nearest muster point, so there is less panic and faster action.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="btn btn-brand">Get campus alerts</Link>
              <Link href="/login" className="btn btn-ghost">Safety Unit login</Link>
            </div>
          </div>

          <div aria-hidden="true" className="mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-[32px] border border-line bg-bg shadow-2xl shadow-black/40">
              <div className="flex flex-col gap-3 rounded-b-[28px] bg-fire p-6 text-white">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-bold tracking-[0.14em]">
                    <Icon name="fire" size={20} /> FIRE OUTBREAK
                  </span>
                  <span className="rounded-full bg-black/30 px-3 py-1 text-[13px]">Now</span>
                </div>
                <span className="font-display text-4xl font-extrabold leading-none">Evacuate now.</span>
                <span className="text-[15px] leading-snug">Leave the building and go to the muster point below.</span>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <div className="card flex items-center gap-3 p-4">
                  <span className="flex size-11 items-center justify-center rounded-[14px] bg-surface-2 text-brand-soft">
                    <Icon name="pin" size={22} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-xs text-muted">Nearest muster point</span>
                    <span className="text-lg font-bold">Muster Point A</span>
                  </span>
                </div>
                <div className="btn btn-safe !min-h-14 text-lg"><Icon name="check" size={22} stroke={2.6} /> I am Safe</div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-[#0d1424]">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="font-display text-3xl font-extrabold">How it works</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="card flex flex-col gap-3 p-6">
                  <span className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-surface-2 text-brand-soft">
                      <Icon name={s.icon} />
                    </span>
                    <span className="eyebrow">Step {i + 1}</span>
                  </span>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="leading-relaxed text-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-3xl font-extrabold">Built for real emergencies</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="card flex gap-4 p-5">
                <span className="flex size-10 flex-none items-center justify-center rounded-xl bg-surface-2 text-brand-soft">
                  <Icon name={f.icon} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-bold">{f.title}</span>
                  <span className="text-[15px] leading-relaxed text-muted">{f.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-8 text-sm text-muted">
          <span>Proposed practical output · Yaba College of Technology</span>
          <span>Department of Industrial Maintenance Engineering</span>
        </div>
      </footer>
    </div>
  );
}
