import { PageWrapper } from "@/components/layout/PageWrapper";
import { FinancialsGrid } from "@/features/financials";
import { financialsData } from "@/data/financialsData";

export default function FinancialMgmt() {
  return (
    <PageWrapper
      title='Financials'
      subtitle='Manage escrow balances, track payouts, and review financial transactions'
      isPopulated={true}
      emptyState={{
        iconUrl: "/svg/financials.svg",
        title: "No transactions yet",
        subtitle:
          "Payments, commissions, and payouts will show here once bookings start happening",
      }}
    >
      <FinancialsGrid data={financialsData} />
    </PageWrapper>
  );
}
