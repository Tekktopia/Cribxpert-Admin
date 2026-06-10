import { PageWrapper } from "@/components/layout/PageWrapper";
import { FinancialsGrid } from "@/features/financials";
import { useGetAdminFinancialsQuery } from "@/api/features/adminFinancials/adminFinancialsApiSlice";

export default function FinancialMgmt() {
  const { data, isLoading, isError } = useGetAdminFinancialsQuery();

  return (
    <PageWrapper
      title='Financials'
      subtitle='Manage escrow balances, track payouts, and review financial transactions'
      isPopulated={!isLoading && !isError && (data?.transactions.length ?? 0) > 0}
      emptyState={{
        iconUrl: "/svg/financials.svg",
        title: "No transactions yet",
        subtitle:
          "Payments, commissions, and payouts will show here once bookings start happening",
      }}
    >
      {isLoading && (
        <div className="flex items-center justify-center py-24 text-sm text-gray-500">
          Loading financials…
        </div>
      )}
      {isError && (
        <div className="flex items-center justify-center py-24 text-sm text-red-500">
          Failed to load financial data. Please try again.
        </div>
      )}
      {data && <FinancialsGrid data={data} />}
    </PageWrapper>
  );
}
