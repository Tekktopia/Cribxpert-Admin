import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";

export default function MessagingMgmt() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Messaging'
          subtitle='Monitor user conversations and flag abusive or suspicious content'
        />
      </div>
    </MainLayout>
  );
}
