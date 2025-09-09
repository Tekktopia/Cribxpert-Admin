import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";

export default function ListingMgmt() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Listings Management'
          subtitle='Review and moderate property listings submitted by hosts'
        />
      </div>
    </MainLayout>
  )
}
