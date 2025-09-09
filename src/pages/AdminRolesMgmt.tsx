import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";

export default function AdminRolesMgmt() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Admin Roles & Permissions'
          subtitle='Manage admin roles and assign access rights for platform operations.'
        />
      </div>
    </MainLayout>
  );
}
