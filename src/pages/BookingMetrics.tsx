import { PageWrapper } from "@/components/layout/PageWrapper";

export default function BookingMetrics() {
  return (
    <PageWrapper
      title='Booking Metrics'
      subtitle='Analyze booking trends, disputes, and payout performance'
      isPopulated={false}
      emptyState={{
        iconUrl: "/svg/booking-metrics.svg",
        title: "No booking data yet",
        subtitle:
          "Bookings and performance insights will show here once activity begins.",
      }}
    >
      {/* Future booking metrics content will go here */}
    </PageWrapper>
  );
}
