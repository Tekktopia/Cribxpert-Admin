// Analytics data and types used by Analytics page/components

export type AnalyticsMetrics = {
  dau: {
    value: string | number;
    change: number;
    changeText: string;
    details?: string;
  };
  mau: {
    value: string | number;
    change: number;
    changeText: string;
    details?: string;
  };
  guestHostRatio: {
    value: string | number;
    change: number;
    changeText: string;
    details?: string;
  };
  conversionRate: {
    value: string | number;
    change: number;
    changeText: string;
    details?: string;
  };
};

export type GrowthPoint = {
  month: string; // e.g., "Aug 2025"
  host: number;
  guest: number;
};

export type DistributionItem = {
  label: string;
  value: number;
  color: string;
};

export type TopHostItem = {
  label: string;
  value: number;
  color: string;
};

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  growth: GrowthPoint[];
  distribution: DistributionItem[];
  topHosts: TopHostItem[];
}

export const analyticsData: AnalyticsData = {
  metrics: {
    dau: {
      value: 300,
      change: 12,
      changeText: "this week",
      details: "Daily Active Users (DAU)",
    },
    mau: {
      value: 3000,
      change: 5,
      changeText: "vs last month",
      details: "Monthly Active Users",
    },
    guestHostRatio: {
      value: "2.5:1",
      change: -0.2,
      changeText: "guests per host",
    },
    conversionRate: {
      value: "10.5%",
      change: -1.5,
      changeText: "Search ➝ Booking",
    },
  },
  growth: [
    { month: "Aug 2025", host: 80, guest: 120 },
    { month: "Sept 2025", host: 200, guest: 820 },
    { month: "Oct 2025", host: 300, guest: 1100 },
    { month: "Nov 2025", host: 650, guest: 1800 },
    { month: "Dec 2025", host: 1000, guest: 2000 },
    { month: "Jan 2026", host: 1150, guest: 2400 },
  ],
  distribution: [
    { label: "Guest", value: 500, color: "#0F6B6F" },
    { label: "Host", value: 140, color: "#9A6200" },
  ],
  topHosts: [
    { label: "Host A", value: 80, color: "#065F46" },
    { label: "Host B", value: 60, color: "#1D4ED8" },
    { label: "Host C", value: 45, color: "#F59E0B" },
    { label: "Host D", value: 20, color: "#EF4444" },
    { label: "Host E", value: 10, color: "#8B5CF6" },
  ],
};
