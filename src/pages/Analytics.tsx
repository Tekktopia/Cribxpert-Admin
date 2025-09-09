import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";

export default function Analytics() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Analytics'
          subtitle='Get insights into user behavior, growth metrics, and listing performance'
        />
      </div>
    </MainLayout>
  );
}
