import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";

export default function KYCVerification() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='KYC Verification'
          subtitle='Approve or reject user ID submissions and ensure compliance'
        />
      </div>
    </MainLayout>
  )
}
