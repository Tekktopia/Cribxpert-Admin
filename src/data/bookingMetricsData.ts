export interface BookingMetricItem {
  value: number | string;
  change: number; // percent
  changeText: string;
  details?: string;
}

export interface BookingTrendsPoint {
  day: string; // e.g., "Jan 1"
  confirmed: number;
  cancelled: number;
  failed: number;
}

export interface BookingStatusSlice {
  label: string; // Confirmed | Cancelled | Failed
  value: number;
  color: string;
}

export interface RecentBookingRow {
  ticketId: string;
  property: string;
  status: "Completed" | "Cancelled" | "Pending" | "Confirmed";
  date: string; // ISO or human
  revenue: string; // formatted currency
  commission: string; // formatted currency
}

export interface TopListingItem {
  title: string;
  author: string;
  image: string; // url
  bookings: number;
}

export interface BookingMetricsData {
  metrics: {
    totalBookings: BookingMetricItem;
    averageValue: BookingMetricItem;
    pendingPayouts: BookingMetricItem;
    openDisputes: BookingMetricItem;
  };
  trends: BookingTrendsPoint[];
  statusBreakdown: BookingStatusSlice[];
  recentBookings: RecentBookingRow[];
  topListings: TopListingItem[];
}

export const bookingMetricsData: BookingMetricsData = {
  metrics: {
    totalBookings: {
      value: 300,
      change: 12,
      changeText: "this week",
      details: "All time bookings",
    },
    averageValue: {
      value: "₦100,000",
      change: 5,
      changeText: "Per booking revenue",
    },
    pendingPayouts: {
      value: "₦10,000",
      change: -1.5,
      changeText: "Host payments due",
    },
    openDisputes: {
      value: 10,
      change: -1.5,
      changeText: "Requiring attention",
    },
  },
  trends: [
    { day: "Jan 1", confirmed: 8, cancelled: 2, failed: 0 },
    { day: "Jan 3", confirmed: 15, cancelled: 3, failed: 0 },
    { day: "Jan 5", confirmed: 20, cancelled: 4, failed: 1 },
    { day: "Jan 7", confirmed: 22, cancelled: 5, failed: 0 },
    { day: "Jan 9", confirmed: 40, cancelled: 6, failed: 1 },
    { day: "Jan 11", confirmed: 78, cancelled: 7, failed: 0 },
    { day: "Jan 13", confirmed: 80, cancelled: 6, failed: 1 },
    { day: "Jan 15", confirmed: 100, cancelled: 8, failed: 0 },
    { day: "Jan 17", confirmed: 95, cancelled: 5, failed: 0 },
    { day: "Jan 21", confirmed: 90, cancelled: 4, failed: 0 },
    { day: "Jan 27", confirmed: 102, cancelled: 9, failed: 2 },
  ],
  statusBreakdown: [
    { label: "Confirmed", value: 500, color: "#0F6B6F" },
    { label: "Cancelled", value: 14, color: "#F6B500" },
    { label: "Failed", value: 2, color: "#F04438" },
  ],
  recentBookings: [
    {
      ticketId: "100012",
      property: "Downtown Apartment",
      status: "Pending",
      date: "2025-08-28",
      revenue: "₦150,000",
      commission: "₦15,000",
    },
    {
      ticketId: "100013",
      property: "Cozy Beach House",
      status: "Completed",
      date: "2025-08-28",
      revenue: "₦250,000",
      commission: "₦25,000",
    },
    {
      ticketId: "100014",
      property: "Mountain View Cabin",
      status: "Confirmed",
      date: "2025-08-27",
      revenue: "₦250,000",
      commission: "₦25,000",
    },
    {
      ticketId: "100023",
      property: "Luxury Villa",
      status: "Cancelled",
      date: "2025-08-27",
      revenue: "₦250,000",
      commission: "₦25,000",
    },
  ],
  topListings: [
    {
      title: "Downtown Apartment",
      author: "By Tope Akinola",
      image: "/images/complaint1.jpg",
      bookings: 152,
    },
    {
      title: "Downtown Apartment",
      author: "By Tope Akinola",
      image: "/images/complaint2.jpg",
      bookings: 152,
    },
    {
      title: "Downtown Apartment",
      author: "By Tope Akinola",
      image: "/images/complaint1.jpg",
      bookings: 152,
    },
    {
      title: "Downtown Apartment",
      author: "By Tope Akinola",
      image: "/images/complaint1.jpg",
      bookings: 152,
    },
    {
      title: "Downtown Apartment",
      author: "By Tope Akinola",
      image: "/images/complaint1.jpg",
      bookings: 152,
    },
  ],
};
