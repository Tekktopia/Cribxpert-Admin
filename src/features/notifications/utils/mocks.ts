import { type NotificationRecord } from "./types";

export const mockNotifications: NotificationRecord[] = [
  {
    id: "n1",
    title: "Platform Maintenance Notice",
    audience: "all",
    message: "We will undergo scheduled maintenance.",
    status: "sent",
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "n2",
    title: "New Host Onboarding Tips",
    audience: "hosts",
    message: "Welcome hosts!",
    status: "sent",
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "n3",
    title: "Holiday Booking Reminder",
    audience: "guests",
    message: "Book early for the holidays.",
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "n4",
    title: "Platform Maintenance Notice",
    audience: "all",
    message: "Maintenance follow-up.",
    status: "sent",
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];
