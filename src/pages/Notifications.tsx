import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";

export default function Notification() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Notification'
          subtitle='Send alerts and updates to all users or specific groups.'
        />
      </div>
    </MainLayout>
  );
}
