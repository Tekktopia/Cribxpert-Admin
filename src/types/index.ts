export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "active" | "pending" | "blocked";
  verificationStatus: "verified" | "pending" | "rejected";
  joinDate: string;
}

export interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  status: "active" | "pending" | "flagged";
  createdAt: string;
  userId: string;
}

export interface Booking {
  id: string;
  listingId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  activeListings: number;
  weeklyBookings: number;
  totalRevenue: number;
  userGrowth: number;
  listingGrowth: number;
  bookingGrowth: number;
  revenueGrowth: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ActivityItem {
  id: string;
  type: "user_verification" | "listing_flagged" | "payout_processed";
  title: string;
  description: string;
  timestamp: string;
  status: "pending" | "completed" | "failed";
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  timestamp: string;
  read: boolean;
}

export interface MessageInsight {
  sent: number;
  unread: number;
  flaggedConversations: number;
}

export interface HealthMetric {
  label: string;
  value: string;
  change: number;
  status: "good" | "warning" | "critical";
}
