import { Icon } from "@/components/icons";
import { ALERT_LABEL, ALERT_HEADLINE, type AlertType } from "@/lib/types";
import { ALERT_STYLE } from "@/lib/alert-style";

export function AlertBanner({
  type,
  time,
  intro,
  rounded = true,
}: {
  type: AlertType;
  time: string;
  intro: string;
  rounded?: boolean;
}) {
  const s = ALERT_STYLE[type];
  return (
    <section
      role="alert"
      className={`flex flex-col gap-3.5 px-5 pt-8 pb-6 ${rounded ? "rounded-b-[28px]" : "rounded-[20px]"}`}
      style={{ background: s.bg, color: s.fg }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 text-[13px] font-bold tracking-[0.14em] uppercase">
          <span className="flex size-10 items-center justify-center rounded-full bg-black/20">
            <Icon name={s.icon} size={22} />
          </span>
          {ALERT_LABEL[type]}
        </span>
        <span className="rounded-full bg-black/30 px-3 py-1.5 text-[13px] font-medium text-white">{time}</span>
      </div>
      <h1 className="font-display text-4xl leading-[1.02] font-extrabold tracking-tight">{ALERT_HEADLINE[type]}</h1>
      <p className="text-base leading-relaxed">{intro}</p>
    </section>
  );
}
