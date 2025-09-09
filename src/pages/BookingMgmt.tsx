import { MainLayout } from '@/components/layout/MainLayout'
import PageTitle from '@/components/layout/PageTitle'

export default function BookingMgmt() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Bookings Management'
          subtitle='Track all bookings, monitor statuses, and manage payment related actions'
        />
      </div>
    </MainLayout>
  )
}
