import type {
  User,
  Listing,
  Booking,
  ActivityItem,
  NotificationItem,
  DashboardMetrics,
} from "@/types";

import type { DashboardData } from "@/data/dashboardData";

export function mapDashboardData(params: {
  metrics: DashboardMetrics;
  users: User[];
  listings: Listing[];
  bookings: Booking[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
}): DashboardData {
  const {
    metrics,
    users,
    listings,
    bookings,
    activities,
    notifications,
  } = params;

  return {
    // -------------------------
    // METRIC CARDS
    // -------------------------
    metrics: {
      totalUsers: {
        value: String(metrics.totalUsers),
        change: metrics.userGrowth,
        changeText: "this week",
      },
      activeListings: {
        value: String(metrics.activeListings),
        change: metrics.listingGrowth,
        changeText: "this week",
      },
      weeklyBookings: {
        value: String(metrics.weeklyBookings),
        change: metrics.bookingGrowth,
        changeText: "vs last week",
      },
      totalRevenue: {
        value: `$${metrics.totalRevenue.toLocaleString()}`,
        change: metrics.revenueGrowth,
        changeText: "vs last week",
      },
    },

    // -------------------------
    // USER MANAGEMENT (CHART)
    // -------------------------
    userManagement: [
      {
        label: "Verified",
        value: users.filter(
          (u) => u.verificationStatus === "verified"
        ).length,
        color: "#0e7490",
      },
      {
        label: "Pending",
        value: users.filter(
          (u) => u.verificationStatus === "pending"
        ).length,
        color: "#f59e0b",
      },
      {
        label: "Blocked",
        value: users.filter((u) => u.status === "blocked").length,
        color: "#ef4444",
      },
    ],

    // -------------------------
    // LISTING SUMMARY (CHART)
    // -------------------------
    listingSummary: [
      {
        label: "Active",
        value: listings.filter((l) => l.status === "active").length,
        color: "#006266",
      },
      {
        label: "Pending",
        value: listings.filter((l) => l.status === "pending").length,
        color: "#FFC107",
      },
      {
        label: "Flagged",
        value: listings.filter((l) => l.status === "flagged").length,
        color: "#FF3E41",
      },
    ],

    // -------------------------
    // BOOKING METRICS
    // -------------------------
    bookingMetrics: {
      dailyBookings: {
        label: "Daily Bookings",
        value: String(bookings.length),
        percentChange: metrics.bookingGrowth,
      },
      avgBookingValue: {
        label: "Avg. Booking Value",
        value: bookings.length
          ? `$${Math.round(
              bookings.reduce((a, b) => a + b.totalAmount, 0) /
                bookings.length
            )}`
          : "$0",
        percentChange: metrics.revenueGrowth,
      },
      bookingsByDay: [], // fill when you add analytics API
      payouts: [],
    },

    // -------------------------
    // KYC COMPLIANCE
    // -------------------------
    kycCompliance: users
      .filter((u) => u.verificationStatus !== "verified")
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar ?? "/avatars/default.png",
        status:
          u.verificationStatus === "pending" ? "pending" : "flagged",
        timestamp: u.joinDate,
      })),

    // -------------------------
    // MESSAGE OVERSIGHT (PLACEHOLDER)
    // -------------------------
    messageOversight: {
      todayCount: 0,
      unreadReports: 0,
      flaggedConversations: [],
    },

    // -------------------------
    // ACTIVITY & NOTIFICATIONS
    // -------------------------
    recentActivity: activities,
    notifications: notifications,

    // -------------------------
    // PLATFORM HEALTH (STATIC FOR NOW)
    // -------------------------
    platformHealth: {
      metrics: [
        {
          label: "Uptime",
          value: "99.9%",
          color: "#10b981",
        },
        {
          label: "Avg. Response",
          value: "1.2s",
          color: "#3b82f6",
        },
      ],
      events: [],
    },
  };
}
