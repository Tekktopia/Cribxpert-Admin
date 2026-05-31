export const csrNavigationItems = [
  {
    label: "Dashboard",
    iconSrc: "/sidebar/dashboard-square-remove.svg",
    href: "/csr/dashboard", // Changed from "/supportdash"
  },
  {
    label: "Users",
    iconSrc: "/sidebar/user-multiple-02.svg",
    href: "/csr/users", // Changed from "/support/users"
  },
  {
    label: "Live Chat",
    iconSrc: "/sidebar/ticket.svg",
    href: "/csr/live-inbox",
    badgeKey: "liveChat" as const,
  },
  {
    label: "Tickets",
    iconSrc: "/sidebar/ticket.svg",
    href: "/csr/tickets",
    badgeKey: "tickets" as const,
  },
  {
    label: "Disputes & Complaints",
    iconSrc: "/sidebar/calendar-edit.svg",
    href: "/csr/disputes", // Changed from "/support/disputes"
  },
  {
    label: "Reports",
    iconSrc: "/sidebar/material-symbols_report-outline.svg",
    href: "/csr/reports", // Changed from "/support/reports"
  },
  {
    label: "Agent Performance",
    iconSrc: "/sidebar/pixel_analytics.svg",
    href: "/csr/agents",
  },
  {
    label: "Notification",
    iconSrc: "/sidebar/notification-block-03.svg",
    href: "/csr/notifications", // Changed from "/support/notifications"
  },
  {
    label: "Settings",
    iconSrc: "/sidebar/setting-2.svg",
    href: "/csr/settings", // Changed from "/support/settings"
  },
  {
    label: "Logout",
    iconSrc: "/sidebar/logout-01.svg",
    href: "/log-out", // Keep this as is
  },
];
