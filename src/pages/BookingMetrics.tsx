import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";

export default function BookingMetrics() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Booking Metrics'
          subtitle='Analyze booking trends, disputes, and payout performance'
        />
      </div>
    </MainLayout>
  )
}
