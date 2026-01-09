import { DashboardHeader } from "../features/dashboard/DashboardHeader";
import { DashboardMetrics } from "../features/dashboard/DashboardMetrics";
import { DashboardGrid } from "../features/dashboard/DashboardGrid";
import { PageWrapper } from "@/components/layout/PageWrapper";

import {
  useGetDashboardMetricsQuery,
  useGetUsersQuery,
  useGetListingsQuery,
  useGetBookingsQuery,
  useGetRecentActivitiesQuery,
  useGetNotificationsQuery,
} from "../store/api/dashboard";

import { mapDashboardData } from "../utils/dashboardMapper";

export function DashboardPage() {
  // -----------------------------
  // PRIMARY METRICS (PAGE GATE)
  // -----------------------------
  const {
    data: metrics,
    isLoading: metricsLoading,
    isError: metricsError,error
  } = useGetDashboardMetricsQuery();

  console.log("Metrics loading:", metricsLoading);
console.log("Metrics error:", metricsError);
console.log("Metrics object:", metrics);
console.log("Metrics API error object:", error);
  // -----------------------------
  // SECONDARY DATA
  // -----------------------------
  const { data: users = [] } = useGetUsersQuery({ page: 1 });
  const { data: listings = [] } = useGetListingsQuery({ page: 1 });
  const { data: bookings = [] } = useGetBookingsQuery({ page: 1 });
  const { data: activities = [] } = useGetRecentActivitiesQuery();
  const { data: notifications = [] } = useGetNotificationsQuery();

    console.log("Metrics loading:", metricsLoading);
  console.log("Metrics error:", metricsError);
  console.log("Metrics data:", metrics);

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (metricsLoading) {
    return (
      <PageWrapper
        title="Dashboard Overview"
        subtitle="Overview of platform activity and key metrics"
        isPopulated={false}
        showDefaultHeader={false}
        headerComponent={<DashboardHeader />}
        emptyState={{
          iconUrl: "/svg/loading.svg",
          title: "Loading dashboard…",
          subtitle: "Fetching your latest data",
        }}
      />
    );
  }

  // -----------------------------
  // ERROR STATE
  // -----------------------------
  if (metricsError || !metrics) {
    return (
      <PageWrapper
        title="Dashboard Overview"
        subtitle="Overview of platform activity and key metrics"
        isPopulated={false}
        showDefaultHeader={false}
        headerComponent={<DashboardHeader />}
        emptyState={{
          iconUrl: "/svg/error.svg",
          title: "Unable to load dashboard",
          subtitle: "Please try again later.",
        }}
      />
    );
  }

  // -----------------------------
  // MAP API → DASHBOARD VIEW MODEL
  // -----------------------------
  const dashboardData = mapDashboardData({
    metrics,
    users,
    listings,
    bookings,
    activities,
    notifications,
  });

  // -----------------------------
  // POPULATED STATE
  // -----------------------------
  const isPopulated =
    metrics.totalUsers > 0 ||
    metrics.activeListings > 0 ||
    metrics.weeklyBookings > 0;

  // -----------------------------
  // NORMAL RENDER
  // -----------------------------
  return (
    <PageWrapper
      title="Dashboard Overview"
      subtitle="Overview of platform activity and key metrics"
      isPopulated={isPopulated}
      showDefaultHeader={false}
      headerComponent={
        <>
          <DashboardHeader />
          <DashboardMetrics metrics={metrics} />
        </>
      }
      emptyState={{
        iconUrl: "/svg/dashboard.svg",
        title: "Your dashboard is quiet… for now.",
        subtitle:
          "Once users start signing up, listings are added, and bookings roll in, you'll see your key platform metrics here — all in one place.",
      }}
    >
      <DashboardGrid data={dashboardData} />
    </PageWrapper>
  );
}
