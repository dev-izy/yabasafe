export type Role = "student" | "guardian" | "officer" | "admin";
export type AlertType = "fire" | "security" | "medical" | "general" | "drill";
export type AudienceKind = "all" | "department" | "hostel";

export type Profile = {
  id: string;
  role: Role;
  full_name: string;
  matric_no: string | null;
  department: string | null;
  hostel: string | null;
  phone: string | null;
};

export type MusterPoint = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  sort: number;
};

export type Alert = {
  id: string;
  type: AlertType;
  area: string;
  instructions: string;
  muster_point_id: string | null;
  audience_kind: AudienceKind;
  audience_value: string | null;
  status: "active" | "cleared";
  created_at: string;
  cleared_at: string | null;
  clear_message: string | null;
};

export const ALERT_LABEL: Record<AlertType, string> = {
  fire: "Fire outbreak",
  security: "Security threat",
  medical: "Medical emergency",
  general: "General campus emergency",
  drill: "Fire drill",
};

export type ReportType = "fire" | "security" | "medical" | "other";
export type ReportStatus = "new" | "acknowledged" | "responding" | "resolved" | "dismissed";

export type IncidentReport = {
  id: string;
  reporter_id: string;
  type: ReportType;
  location: string;
  details: string;
  status: ReportStatus;
  linked_alert_id: string | null;
  created_at: string;
  updated_at: string;
};

export const REPORT_LABEL: Record<ReportType, string> = {
  fire: "Fire",
  security: "Security threat",
  medical: "Medical emergency",
  other: "Something else",
};

// What the student sees about their own report.
export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  new: "Sent. Waiting for the safety unit",
  acknowledged: "Received by the safety unit",
  responding: "Help is responding",
  resolved: "Resolved",
  dismissed: "Closed by the safety unit",
};

// Which alert type a report turns into when an officer sends an alert from it.
export const REPORT_TO_ALERT: Record<ReportType, AlertType> = {
  fire: "fire",
  security: "security",
  medical: "medical",
  other: "general",
};

export const ALERT_HEADLINE: Record<AlertType, string> = {
  fire: "Evacuate now.",
  security: "Stay safe. Follow instructions.",
  medical: "Medical emergency reported.",
  general: "Campus emergency.",
  drill: "Fire drill.",
};
