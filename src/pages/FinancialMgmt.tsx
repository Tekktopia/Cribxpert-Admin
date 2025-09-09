import { MainLayout } from "@/components/layout/MainLayout";
import PageTitle from "@/components/layout/PageTitle";
import { EmptyState } from "@/components/layout/EmptyState";

export default function FinancialMgmt() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <PageTitle
          title='Financials'
          subtitle='Manage escrow balances, track payouts, and review financial transactions'
        />
        <EmptyState
          iconUrl='/svg/financials.svg'
          title='Financial data will appear here'
          subtitle='Manage escrow balances, track payouts, and review financial transactions once data is available.'
        />
      </div>
    </MainLayout>
  );
}
