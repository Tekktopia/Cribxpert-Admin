import { useState } from 'react';
import { FinancePageWrapper } from "@/components/layout/FinancePageWrapper";
import { DashboardHeader } from "@/features/dashboard/DashboardHeader";
import  { FinanceMetricsCards } from "@/features/finance-admin/FinanceMetricsCards";
import { EmptyFinanceState } from "@/features/finance-admin/EmptyFinanceState";
import { FinanceTable } from "@/features/finance-admin/FinanceTable";
import { DetailsModal } from "@/features/finance-admin/DetailsModal"; 

// Match imports exactly to your financeAdminData.ts file
import { financeData, type Transaction } from "@/data/financeAdminData";

export default function FinanceDashboard() {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Derive "hasData" from your actual recentTransactions array
  const hasData = financeData.recentTransactions.length > 0;

  return (
    <FinancePageWrapper
      title="Finance Dashboard"
      isPopulated={hasData}
      headerComponent={
        <DashboardHeader
          title="Finance Dashboard"
          subtitle="Manage payouts, monitor transactions, and track platform revenue"
          primaryButtonText="Download Financial Report"
          showSecondaryButton={true}
          secondaryButtonText="Filter Transactions"
          onPrimaryButtonClick={() => console.log("Downloading report...")}
          onSecondaryButtonClick={() => console.log("Opening filters...")}
        />
      }
      emptyState={
        <EmptyFinanceState
          imageUrl="/emptyState.svg"
          title="No Transactions Found"
          subtitle="Monitor Revenue, Payouts, And Refunds Once Activity Starts"
          onRefresh={() => window.location.reload()}
        />
      }
    >
      {/* Passes the metrics array from your financeData object */}
      <FinanceMetricsCards metrics={financeData.metrics} />
      
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
          <button className="text-teal-700 text-sm font-semibold hover:underline">View all</button>
        </div>
        
        <FinanceTable 
          data={financeData.recentTransactions} 
          onRowClick={(tx) => setSelectedTx(tx)} 
        />
      </div>

      {/* Slide-over details modal */}
      {selectedTx && (
        <DetailsModal 
          isOpen={!!selectedTx} 
          onClose={() => setSelectedTx(null)} 
          transaction={selectedTx}
        />
      )}
    </FinancePageWrapper>
  );
}