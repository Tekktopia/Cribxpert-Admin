import { DashboardHeader } from "../features/dashboard/DashboardHeader";
import { DashboardMetrics } from "../features/dashboard/DashboardMetrics";
import { DashboardGrid } from "../features/dashboard/DashboardGrid";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { dashboardData } from "../data/dashboardData";

export function DashboardPage() {
  // State to toggle between populated and empty view (for demo purposes)
  const isPopulated = true;

  return (
    <PageWrapper
      title='Dashboard Overview'
      subtitle='Overview of platform activity and key metrics'
      isPopulated={isPopulated}
      showDefaultHeader={false} // We use DashboardHeader instead
      headerComponent={
        <>
          <DashboardHeader />
          <DashboardMetrics metrics={dashboardData.metrics} />
        </>
      }
      emptyState={{
        iconUrl: "/svg/dashboard.svg",
        title: "Your dashboard is quiet… for now.",
        subtitle:
          "Once users start signing up, listings are added, and bookings roll in, you'll see your key platform metrics here — all in one place.",
      }}
    >
      {/* Metrics Cards */}

      {/* Main Content */}
      <DashboardGrid data={dashboardData} />
    </PageWrapper>
  );
}
