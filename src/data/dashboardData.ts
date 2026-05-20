// Dashboard data types and sample data

export interface MetricData {
  value: string;
  change: number;
  changeText: string;
  details?: string;
}

export interface ChartData {
  label: string;
  value: number;
  color: string;
}

export interface BookingDay {
  day: string;
  value: number;
}

export interface PayoutData {
  label: string;
  value: string;
  status: "completed" | "pending" | "dispute";
}

export interface BookingMetrics {
  dailyBookings: {
    label: string;
    value: string;
    percentChange: number;
  };
  avgBookingValue: {
    label: string;
    value: string;
    percentChange: number;
  };
  bookingsByDay: BookingDay[];
  payouts: PayoutData[];
}

export interface KYCUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "pending" | "flagged" | "verified";
  timestamp: string;
}

export interface FlaggedConversation {
  id: string;
  participants: string;
  message: string;
  reason: string;
  timestamp: string;
  priority: "High" | "Medium" | "Low";
}

export interface MessageOversightData {
  todayCount: number;
  unreadReports: number;
  flaggedConversations: FlaggedConversation[];
}

export interface ActivityItem {
  id: string;
  type: "user_verification" | "listing_flagged" | "payout_processed";
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}

export interface NotificationItem {
  id: string;
  type: "system_alert" | "suspicious_activity" | "maintenance" | "broadcast";
  title: string;
  description: string;
  timestamp: string;
  priority: "High" | "Medium" | "Low";
  status: "unread" | "read";
}

export interface PlatformMetric {
  label: string;
  value: string;
  color: string;
}

export interface PlatformEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface PlatformHealthData {
  metrics: PlatformMetric[];
  events: PlatformEvent[];
}

export interface DashboardData {
  metrics: {
    totalUsers: MetricData;
    activeListings: MetricData;
    weeklyBookings: MetricData;
    totalRevenue: MetricData;
  };
  userManagement: ChartData[];
  listingSummary: ChartData[];
  bookingMetrics: BookingMetrics;
  kycCompliance: KYCUser[];
  messageOversight: MessageOversightData;
  recentActivity: ActivityItem[];
  notifications: NotificationItem[];
  platformHealth: PlatformHealthData;
}

// Sample data for the dashboard
export const dashboardData: DashboardData = {
  // Data for metric cards
  metrics: {
    totalUsers: {
      value: "30",
      change: 12,
      changeText: "this week",
      details: "All registered accounts",
    },
    activeListings: {
      value: "30",
      change: 5,
      changeText: "this week",
    },
    weeklyBookings: {
      value: "30",
      change: 15,
      changeText: "vs last week",
    },
    totalRevenue: {
      value: "₦3,000",
      change: 12,
      changeText: "vs last week",
    },
  },

  // User management data
  userManagement: [
    { label: "Verified", value: 200, color: "#0e7490" }, // Cyan-700
    { label: "Pending", value: 104, color: "#f59e0b" }, // Amber-500
    { label: "Blocked", value: 54, color: "#ef4444" }, // Red-500
  ],

  // Listing summary data
  listingSummary: [
    { label: "Active", value: 80, color: "#006266" }, // Exact Teal from Figma
    { label: "Inactive", value: 60, color: "#0072CE" }, // Exact Blue from Figma
    { label: "Pending", value: 40, color: "#FFC107" }, // Exact Amber from Figma
    { label: "Flagged", value: 10, color: "#FF3E41" }, // Exact Red from Figma
  ],

  // Booking and financial metrics
  bookingMetrics: {
    dailyBookings: {
      label: "Daily Bookings",
      value: "12",
      percentChange: 8.2,
    },
    avgBookingValue: {
      label: "Avg. Booking Value",
      value: "₦120",
      percentChange: 12.2,
    },
    bookingsByDay: [
      { day: "Sunday", value: 8 },
      { day: "Monday", value: 5 },
      { day: "Tuesday", value: 10 },
      { day: "Wednesday", value: 15 },
      { day: "Thursday", value: 12 },
      { day: "Friday", value: 20 },
      { day: "Saturday", value: 18 },
    ],
    payouts: [
      {
        label: "Completed Payouts",
        value: "₦2,500",
        status: "completed" as const,
      },
      {
        label: "Pending Payouts",
        value: "₦600",
        status: "pending" as const,
      },
      {
        label: "Escrow Disputes",
        value: "6",
        status: "dispute" as const,
      },
    ],
  },

  // KYC compliance data
  kycCompliance: [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      avatar: "/avatars/sarah.png",
      status: "pending" as const,
      timestamp: "2mins ago",
    },
    {
      id: "2",
      name: "Michael Ojo",
      email: "michael.o@example.com",
      avatar: "/avatars/michael.png",
      status: "flagged" as const,
      timestamp: "2hrs ago",
    },
    {
      id: "3",
      name: "Cynthia Okoro",
      email: "cynthia.o@example.com",
      avatar: "/avatars/cynthia.png",
      status: "pending" as const,
      timestamp: "2hrs ago",
    },
  ],

  // Message oversight data
  messageOversight: {
    todayCount: 500,
    unreadReports: 500,
    flaggedConversations: [
      {
        id: "1",
        participants: "Alex Thompson → Lisa Ojo",
        message: "Can we meet outside the platform for...",
        reason: "Off-platform communication",
        timestamp: "2hrs ago",
        priority: "High" as const,
      },
      {
        id: "2",
        participants: "Mark Dare → Emma David",
        message: "I can offer you a better deal if...",
        reason: "Price manipulation",
        timestamp: "2hrs ago",
        priority: "Medium" as const,
      },
    ],
  },

  // Recent activity data
  recentActivity: [
    {
      id: "1",
      type: "user_verification" as const,
      title: "User Verification Approved",
      description: "John Deyemi",
      timestamp: "2mins ago",
      status: "completed" as const,
    },
    {
      id: "2",
      type: "listing_flagged" as const,
      title: "Listing Flagged For Review",
      description: "Property #1234",
      timestamp: "3mins ago",
      status: "pending" as const,
    },
    {
      id: "3",
      type: "payout_processed" as const,
      title: "Payout Processed",
      description: "Sarah Wilson - ₦450",
      timestamp: "4mins ago",
      status: "completed" as const,
    },
  ],

  // Notification center data
  notifications: [
    {
      id: "1",
      type: "system_alert" as const,
      title: "System Alerts",
      description: "Multiple failed login attempts from IP 192.168.1.100",
      timestamp: "5mins ago",
      priority: "High" as const,
      status: "unread" as const,
    },
    {
      id: "2",
      type: "suspicious_activity" as const,
      title: "Suspicious Activity Detected",
      description:
        "Booking date 23-24-320-780 has an activity dispute requiring attention",
      timestamp: "7mins ago",
      priority: "High" as const,
      status: "unread" as const,
    },
    {
      id: "3",
      type: "maintenance" as const,
      title: "System Maintenance Scheduled",
      description: "Scheduled maintenance window from 2:00 AM - 4:00 AM EST",
      timestamp: "1hr ago",
      priority: "Medium" as const,
      status: "unread" as const,
    },
  ],

  // Platform health data
  platformHealth: {
    metrics: [
      {
        label: "Uptime",
        value: "99.9%",
        color: "#10b981", // green
      },
      {
        label: "Avg. Response",
        value: "1.2s",
        color: "#3b82f6", // blue
      },
      {
        label: "Daily Request",
        value: "154",
        color: "#6366f1", // indigo
      },
    ],
    events: [
      {
        id: "1",
        title: "User Account Blocked",
        description: "by Sarah Johnson • user@example.co",
        timestamp: "1:30am",
      },
      {
        id: "2",
        title: "Listing Approved",
        description: "by Mike Kenny • Downtown Apartment",
        timestamp: "1:30am",
      },
      {
        id: "3",
        title: "Payment Released",
        description: "by Sarah Johnson • Booking #BR-2025-001",
        timestamp: "1:30am",
      },
    ],
  },
};
