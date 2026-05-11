// src/types/booking.types.ts
export interface BookingMetrics {
  totalBookings: number;
  averageBookingValue: number;
  pendingPayouts: number;
  openDisputes: number;
  weeklyGrowth: number;
  perBookingVolume: number;
  hourlyPaymentsDue: number;
  requiringAttention: number;
}

export interface BookingTrend {
  date: string;
  confirmed: number;
  cancelled: number;
  failed: number;
}

export interface RecentBooking {
  id: string;
  ticketId: string;
  propertyName: string;
  status: 'confirmed' | 'cancelled' | 'pending' | 'failed';
  date: string;
  revenue: number;
  commission: number;
  guestName?: string;
  hostName?: string;
}

export interface TopListing {
  id: string;
  name: string;
  hostName: string;
  totalBookings: number;
  totalRevenue: number;
  imageUrl?: string;
}

export interface BookingFilters {
  startDate?: string;
  endDate?: string;
  status?: string[];
  propertyId?: string;
  limit?: number;
  offset?: number;
}