import { MainLayout } from "../components/layout/MainLayout";
import { DashboardHeader } from "../features/dashboard/DashboardHeader";
import { DashboardMetrics } from "../features/dashboard/DashboardMetrics";
import { DashboardGrid } from "../features/dashboard/DashboardGrid";
import { DashboardEmptyState } from "../features/dashboard/DashboardEmptyState";
import { dashboardData } from "../data/dashboardData";

export function DashboardPage() {
  // State to toggle between populated and empty view (for demo purposes)
  const isPopulated = true;

  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <DashboardHeader />

        {/* Metrics Cards */}
        <DashboardMetrics metrics={dashboardData.metrics} />

        {/* Main Content */}
        {isPopulated ? (
          <DashboardGrid data={dashboardData} />
        ) : (
          <DashboardEmptyState />
        )}
      </div>
    </MainLayout>
  );
}
