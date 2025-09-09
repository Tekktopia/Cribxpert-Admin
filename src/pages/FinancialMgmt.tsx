import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";

export default function FinancialMgmt() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Financials'
          subtitle='Manage escrow balances, track payouts, and review financial transactions'
        />
      </div>
    </MainLayout>
  );
}
