import type { AlertType } from "@/lib/types";
import type { IconName } from "@/components/icons";

// Banner colours are picked so white (or dark) text stays above 4.5:1.
export const ALERT_STYLE: Record<
  AlertType,
  { bg: string; fg: string; icon: IconName; soft: string; tint: string }
> = {
  fire: { bg: "#D2370F", fg: "#FFFFFF", icon: "fire", soft: "#3A1A10", tint: "#FF8A5C" },
  security: { bg: "#1D4FD1", fg: "#FFFFFF", icon: "shield", soft: "#14214A", tint: "#7FB0FF" },
  medical: { bg: "#B01E5A", fg: "#FFFFFF", icon: "medical", soft: "#3A1428", tint: "#FF8FBC" },
  general: { bg: "#8A5200", fg: "#FFFFFF", icon: "bell", soft: "#33290F", tint: "#FFC95C" },
  drill: { bg: "#FFB020", fg: "#1A1200", icon: "clock", soft: "#33290F", tint: "#FFC95C" },
};
