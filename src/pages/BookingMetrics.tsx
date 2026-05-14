// src/pages/admin/BookingMetrics.tsx
import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  BookingMetricsHeader,
  BookingMetricsCards,
  BookingChartsGrid,
  RecentBookingsTable,
  TopBookedListings,
} from "@/features/bookingmetrics";
import { useGetBookingMetricsQuery } from "@/api/features/adminBookingMetrics/bookingMetricsApiSlice";
import { Loader2 } from "lucide-react";

export default function BookingMetrics() {
  const { data, isLoading, error } = useGetBookingMetricsQuery();

  if (isLoading) {
    return (
      <PageWrapper
        title='Booking Metrics'
        subtitle='Analyze booking trends, disputes, and payout performance'
        isPopulated={false}
        showDefaultHeader={false}
        headerComponent={<BookingMetricsHeader />}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper
        title='Booking Metrics'
        subtitle='Analyze booking trends, disputes, and payout performance'
        isPopulated={false}
        showDefaultHeader={false}
        headerComponent={<BookingMetricsHeader />}
      >
        <div className="text-red-500 text-center p-8">
          Error loading metrics: {JSON.stringify(error)}
        </div>
      </PageWrapper>
    );
  }

  // ✅ USE REAL DATA FROM API
  const metrics = {
    totalBookings: data?.totalBookings || {
      value: 0,
      change: 0,
      changeText: 'this week',
      details: 'All time bookings'
    },
    averageValue: data?.averageValue || {
      value: '₹0',
      change: 0,
      changeText: 'this week'
    },
    pendingPayouts: data?.pendingPayouts || {
      value: '₹0',
      change: 0,
      changeText: 'this week'
    },
    openDisputes: data?.openDisputes || {
      value: 0,
      change: 0,
      changeText: 'this week'
    }
  };

  const isPopulated = metrics.totalBookings.value > 0;

  return (
    <PageWrapper
      title='Booking Metrics'
      subtitle='Analyze booking trends, disputes, and payout performance'
      isPopulated={isPopulated}
      showDefaultHeader={false}
      headerComponent={<BookingMetricsHeader />}
      emptyState={{
        iconUrl: "/svg/booking-metrics.svg",
        title: "No booking data yet",
        subtitle: "Bookings and performance insights will show here once activity begins.",
      }}
    >
      {/* Pass the real metrics data */}
      <BookingMetricsCards metrics={metrics} />

      {/* Charts - still using static data for now */}
      <BookingChartsGrid
        trends={data?.trends || []}
        statusBreakdown={data?.statusBreakdown || []}
      />
      {/* Tables - still using static data for now */}
      <div className='grid grid-cols-1 gap-6'>
        <RecentBookingsTable rows={(data?.recentBookings || []) as any} />
        <TopBookedListings items={data?.topListings || []} />
      </div>
    </PageWrapper>
  );
}