// pages/finance/FinanceDashboard.jsx
import { FinancePageWrapper } from "@/components/layout/FinancePageWrapper";
import { DashboardHeader } from "@/features/dashboard/DashboardHeader";
import { FinanceMetricsCards } from "@/features/finance-admin/FinanceMetricsCards";
import { financeData } from "@/data/financeAdminData";
import { EmptyFinanceState } from "@/features/finance-admin/EmptyFinanceState";

export default function FinanceDashboard() {
  const handleGenerateReport = () => {
    console.log("Generating finance report...");
    // Your report generation logic
  };

  const handleFilterTransactions = () => {
    console.log("Opening transaction filters...");
    // Your filter logic
  };

  const handleTimeFilterChange = (value) => {
    console.log("Time filter changed to:", value);
    // Update data based on time filter
  };

  // Set this to true if you have data, false to show empty state
  const hasData = true; // Change this based on your actual data check

  return (
    <FinancePageWrapper
      title="Finance Dashboard"
      subtitle="Overview of financial metrics and performance"
      isPopulated={hasData}
      headerComponent={
        <DashboardHeader
          title="Finance Dashboard"
          subtitle="Manage payouts, monitor transactions, and track platform revenue"
          timeFilterOptions={[
            { value: 'today', label: 'Today' },
            { value: 'this-week', label: 'This Week' },
            { value: 'this-month', label: 'This Month' },
            { value: 'this-quarter', label: 'This Quarter' },
          ]}
          primaryButtonText="Download Financial Report"
          showSecondaryButton={true}
          secondaryButtonText="Filter Transactions"
          onTimeFilterChange={handleTimeFilterChange}
          onPrimaryButtonClick={handleGenerateReport}
          onSecondaryButtonClick={handleFilterTransactions}
        />
      }
      showDefaultHeader={false}
      showHeader={true}
      emptyState={
        <EmptyFinanceState
        imageUrl="/src/assets/emptyState.svg"
          title="Welcome to Finance Dashboard"
          subtitle="Monitor Revenue, Payouts, And Refunds Once Activity Starts"
          showRefreshButton={true}
          refreshButtonText="Refresh"
          onRefresh={() => console.log("Refreshing...")}
        />
      }
    >
      {/* This only renders when isPopulated={true} */}
      <FinanceMetricsCards metrics={financeData.metrics} />
      
      {/* You can add more components here when there's data */}
      {hasData && (
        <div className="mt-6">
          {/* Add charts, tables, or other finance components here */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Financial Analytics</h3>
            <p className="text-gray-600">More financial metrics and charts will be displayed here.</p>
          </div>
        </div>
      )}
    </FinancePageWrapper>
  );
}