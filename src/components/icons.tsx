const PATHS = {
  fire: ["M12 3c1 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2.5-4.5 0 1.3.6 2.3 1.6 2.6C10.5 8.5 11 5.5 12 3z"],
  shield: ["M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"],
  shieldCheck: ["M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z", "M8.5 12l2.5 2.5 4.5-5"],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  pin: ["M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z", "M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"],
  bell: ["M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7", "M10 20a2 2 0 0 0 4 0"],
  home: ["M4 11l8-7 8 7v9H4z"],
  clock: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 7v5l3 2"],
  plus: ["M12 5v14M5 12h14"],
  pulse: ["M3 12h4l3-7 4 14 3-7h4"],
  send: ["M4 12l16-8-6 16-3-7z"],
  medical: ["M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z", "M12 8v8M8 12h8"],
  users: ["M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z", "M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6", "M17 11a3 3 0 1 0 0-6", "M21.5 20c0-2.6-1.6-4.6-4-5.5"],
  sms: ["M4 5h16v11H9l-5 4z"],
  list: ["M5 4h14v16H5z", "M9 9h6M9 13h6M9 17h3"],
  logout: ["M9 4H5v16h4", "M16 8l4 4-4 4M20 12H9"],
  warn: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 8v5M12 16.5h.01"],
  phone: ["M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"],
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  stroke = 2,
  className,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="flex items-center justify-center rounded-[11px] bg-brand text-brand-ink"
        style={{ width: size, height: size }}
      >
        <Icon name="shieldCheck" size={size * 0.56} stroke={2.4} />
      </span>
      <span className="font-display text-xl font-extrabold">YabaSafe</span>
    </span>
  );
}
