import { type NotificationStatus } from "./types";

export function formatDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date}\n${time}`;
}

export function statusToBadge(status: NotificationStatus): {
  label: string;
  variant: "success" | "destructive" | "pending" | "secondary";
} {
  switch (status) {
    case "sent":
      return { label: "Sent", variant: "success" };
    case "scheduled":
      return { label: "Scheduled", variant: "pending" };
    case "failed":
      return { label: "Failed", variant: "destructive" };
    case "draft":
    default:
      return { label: "Draft", variant: "secondary" };
  }
}
