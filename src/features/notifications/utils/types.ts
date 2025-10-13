export type Audience = "all" | "hosts" | "guests" | "custom";

export type NotificationStatus = "sent" | "scheduled" | "draft" | "failed";

export interface NotificationRecord {
  id: string;
  title: string;
  audience: Audience;
  message: string;
  status: NotificationStatus;
  scheduledAt?: string; // ISO
  sentAt?: string; // ISO
  createdAt: string; // ISO
}
