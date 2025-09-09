import { PageWrapper } from "@/components/layout/PageWrapper";

export default function FinancialMgmt() {
  return (
    <PageWrapper
      title='Financials'
      subtitle='Manage escrow balances, track payouts, and review financial transactions'
      isPopulated={false}
      emptyState={{
        iconUrl: "/svg/financials.svg",
        title: "No transactions yet",
        subtitle:
          "Payments, commissions, and payouts will show here once bookings start happening",
      }}
    >
      {/* Future financial management content will go here */}
    </PageWrapper>
  );
}
