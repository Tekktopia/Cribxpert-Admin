import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";

export default function Settings() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Settings'
          subtitle='Configure platform settings and manage admin roles'
        />
      </div>
    </MainLayout>
  );
}
