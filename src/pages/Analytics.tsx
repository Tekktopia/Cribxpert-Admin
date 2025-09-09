import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";
import { EmptyState } from "@/components/layout/EmptyState";

export default function Analytics() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Analytics'
          subtitle='Get insights into user behavior, growth metrics, and listing performance'
        />
        <EmptyState
          iconUrl='/svg/analytics.svg'
          title='Analytics will appear here'
          subtitle='Track user growth, top listings, and engagement once data is available.'
        />
      </div>
    </MainLayout>
  );
}
