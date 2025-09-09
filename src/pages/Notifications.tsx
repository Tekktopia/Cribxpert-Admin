import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";
import { EmptyState } from "@/components/layout/EmptyState";

export default function Notification() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Notification'
          subtitle='Send alerts and updates to all users or specific groups.'
        />
        <EmptyState
          iconUrl='/svg/notification.svg'
          title='No notification yet'
          subtitle='Bookings and performance insights will show here once activity begins.'
        />
      </div>
    </MainLayout>
  );
}
