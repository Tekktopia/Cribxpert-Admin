import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";
import { EmptyState } from "@/components/layout/EmptyState";

export default function BookingMetrics() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Booking Metrics'
          subtitle='Analyze booking trends, disputes, and payout performance'
        />
        <EmptyState 
          iconUrl="/svg/booking-metrics.svg"
          title="Booking metrics will appear here"
          subtitle="Analyze booking trends, disputes, and payout performance once data is available."
        />
      </div>
    </MainLayout>
  )
}
