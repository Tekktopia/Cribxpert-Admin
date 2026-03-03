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
  type: "system_alert" | "suspicious_activity" | "maintenance" | "broadcast";
  title: string;
  description: string;
  timestamp: string;
  priority: "High" | "Medium" | "Low";
  status: "unread" | "read";
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

// Messaging domain types
export interface Participant {
  id: string;
  name: string;
  role?: "Guest" | "Host" | "Support";
  avatar?: string; // path under /public/avatars or fallback initials
  initials?: string; // if no avatar, show initials in AvatarFallback
}

export interface Conversation {
  id: string;
  participants: Participant[]; // typically 2 for guest/host, but support group/system
  lastMessageAt: string; // ISO string
  preview: string; // text preview of last message
  unreadCount: number;
  status: "normal" | "flagged" | "archived";
  contextSubtitle?: string; // e.g., "Makinwa's cottage" for the header subtitle
}

export interface MessageAttachment {
  id: string;
  type: "image" | "file";
  url: string;
  name?: string;
  sizeLabel?: string; // e.g., "15 KB"
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string; // ISO string
  isFlagged?: boolean;
  attachments?: MessageAttachment[];
}
