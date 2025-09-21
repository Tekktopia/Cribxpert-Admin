import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  BookingMetricsHeader,
  BookingMetricsCards,
  BookingChartsGrid,
  RecentBookingsTable,
  TopBookedListings,
} from "@/features/bookingmetrics";
import { bookingMetricsData } from "@/data/bookingMetricsData";

export default function BookingMetrics() {
  const isPopulated = true;

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
        subtitle:
          "Bookings and performance insights will show here once activity begins.",
      }}
    >
      {/* Metric cards */}
      <BookingMetricsCards metrics={bookingMetricsData.metrics} />

      {/* Charts */}
      <BookingChartsGrid
        trends={bookingMetricsData.trends}
        statusBreakdown={bookingMetricsData.statusBreakdown}
      />

      {/* Tables */}
      <div className='grid grid-cols-1 gap-6'>
        <RecentBookingsTable rows={bookingMetricsData.recentBookings} />
        <TopBookedListings items={bookingMetricsData.topListings} />
      </div>
    </PageWrapper>
  );
}
