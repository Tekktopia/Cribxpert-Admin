import { useMemo } from "react";
import { useRealtimeRefetch } from "@/hooks/useRealtimeRefetch";
import { DashboardHeader } from "../features/dashboard/DashboardHeader";
import { DashboardMetrics } from "../features/dashboard/DashboardMetrics";
import { DashboardGrid } from "../features/dashboard/DashboardGrid";
import { PageWrapper } from "@/components/layout/PageWrapper";
import LoadingPage from "@/components/ui/LoadingPage";
import {
  useGetDashboardCardsQuery,
  useGetUserManagementQuery,
  useGetRecentActivityQuery,
  useGetListingSummaryQuery,
  useGetTotalRevenueQuery,
  useGetBookingStatusBreakdownQuery,
} from "@/api/features/adminDashboard/adminDashboardApiSlice";
import { dashboardData } from "../data/dashboardData";
import type {
  DashboardData,
  MetricData as SampleMetricData,
} from "../data/dashboardData";
import type {
  DashboardUIMetrics,
  MetricData as UIMetricData,
} from "../types/dashboardUi";
import {
  generateDynamicReport,
  reportToMarkdown,
} from "@/utils/generateHealthReport";
const toUIMetric = (
  value: number,
  changeText: string,
  details?: string,
): UIMetricData => ({
  value,
  change: 0,
  changeText,
  details,
});

export function DashboardPage() {
  const { data: cardsData, isLoading: cardsLoading, refetch: refetchCards } = useGetDashboardCardsQuery();
  const { data: userMgmtData, isLoading: userMgmtLoading, refetch: refetchUsers } = useGetUserManagementQuery();
  const { data: activityData, isLoading: activityLoading, refetch: refetchActivity } = useGetRecentActivityQuery({ limit: 20 });
  const { data: listingSummaryData, isLoading: listingSummaryLoading, refetch: refetchListings } = useGetListingSummaryQuery();
  const { data: revenueData, refetch: refetchRevenue } = useGetTotalRevenueQuery();
  const { data: bookingBreakdownData, refetch: refetchBreakdown } = useGetBookingStatusBreakdownQuery();

  useRealtimeRefetch(['listings'], refetchListings, 'listings');
  useRealtimeRefetch(['profiles'], refetchUsers, 'users');
  useRealtimeRefetch(['bookings', 'listings', 'profiles'], refetchCards, 'cards');
  useRealtimeRefetch(['bookings', 'listings', 'profiles'], refetchActivity, 'activity');
  useRealtimeRefetch(['bookings'], refetchRevenue, 'revenue');
  useRealtimeRefetch(['bookings'], refetchBreakdown, 'breakdown');

  const uiMetrics: DashboardUIMetrics = useMemo(() => {
    if (!cardsData) {
      const m = dashboardData.metrics;
      const parse = (metric: SampleMetricData) =>
        Number(metric.value.replace(/[^0-9.-]+/g, "")) || 0;

      return {
        totalUsers: toUIMetric(
          parse(m.totalUsers),
          m.totalUsers.changeText,
          m.totalUsers.details,
        ),
        adminTeam: toUIMetric(0, ""),
        kycPending: toUIMetric(0, ""),
        activeListings: toUIMetric(
          parse(m.activeListings),
          m.activeListings.changeText,
        ),
        weeklyBookings: toUIMetric(
          parse(m.weeklyBookings),
          m.weeklyBookings.changeText,
        ),
        totalRevenue: toUIMetric(
          revenueData?.totalRevenue ?? parse(m.totalRevenue),
          m.totalRevenue.changeText,
        ),
      };
    }

    return {
      totalUsers: toUIMetric(
        cardsData.totalUsers,
        "this week",
        "All registered accounts",
      ),
      adminTeam: toUIMetric(
        cardsData.adminTeam,
        "",
        "Admins & staff",
      ),
      kycPending: toUIMetric(
        cardsData.kycPending,
        "",
        "Awaiting verification",
      ),
      activeListings: toUIMetric(cardsData.activeListings, "this week"),
      weeklyBookings: toUIMetric(cardsData.weeklyBookings, "vs last week"),
      totalRevenue: toUIMetric(
        revenueData?.totalRevenue ?? 0,
        dashboardData.metrics.totalRevenue.changeText,
      ),
    };
  }, [cardsData, revenueData]);

  const combinedData: DashboardData = useMemo(() => {
    // Start from the existing sample dashboard data
    const base = dashboardData;

    // Metrics: override counts if we have card data
    const metrics: DashboardData["metrics"] = cardsData
      ? {
          ...base.metrics,
          totalUsers: {
            ...base.metrics.totalUsers,
            value: String(cardsData.totalUsers),
          },
          activeListings: {
            ...base.metrics.activeListings,
            value: String(cardsData.activeListings),
          },
          weeklyBookings: {
            ...base.metrics.weeklyBookings,
            value: String(cardsData.weeklyBookings),
          },
          totalRevenue: base.metrics.totalRevenue,
        }
      : base.metrics;

    // User management chart
    const userManagement: DashboardData["userManagement"] = userMgmtData
      ? [
          {
            label: "Verified",
            value: userMgmtData.verifiedUsers,
            color: "#0e7490",
          },
          {
            label: "Awaiting review",
            value: userMgmtData.awaitingReview,
            color: "#f59e0b",
          },
          {
            label: "Not submitted",
            value: userMgmtData.notSubmitted,
            color: "#94a3b8",
          },
          {
            label: "Blocked",
            value: userMgmtData.blockedUsers,
            color: "#ef4444",
          },
        ]
      : base.userManagement;

    // Recent activity timeline
    const recentActivity: DashboardData["recentActivity"] =
      activityData?.activities?.map((activity, index) => {
        let type: "user_verification" | "listing_flagged" | "payout_processed" =
          "user_verification";
        let title = "";
        let description = "";
        let status: "completed" | "pending" | "failed" = "completed";

        if (activity.type === "signup") {
          type = "user_verification";
          title = "New user signup";
          description =
            activity.user?.fullName ||
            activity.user?.email ||
            "New user account";
          status = "completed";
        } else if (activity.type === "listing_update") {
          type = "listing_flagged";
          title = "Listing updated";
          description = activity.listing?.name || "Listing updated";
          status = "pending";
        } else if (activity.type === "booking") {
          type = "payout_processed";
          title = "New booking";
          description = `${activity.user?.fullName || "User"} - ₦${(
            activity.booking?.totalPrice ?? 0
          ).toLocaleString()}`;
          status =
            activity.booking?.status === "confirmed" ? "completed" : "pending";
        }

        const timestamp = new Date(activity.timestamp);
        const now = new Date();
        const diffMs = now.getTime() - timestamp.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        let timeAgo = "";
        if (diffMins < 1) {
          timeAgo = "Just now";
        } else if (diffMins < 60) {
          timeAgo = `${diffMins}mins ago`;
        } else if (diffHours < 24) {
          timeAgo = `${diffHours}hrs ago`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          timeAgo = `${diffDays}days ago`;
        }

        return {
          id:
            activity.user?._id ||
            activity.listing?._id ||
            activity.booking?._id ||
            String(index),
          type,
          title,
          description,
          timestamp: timeAgo,
          status,
        };
      }) ?? base.recentActivity;

    // Listing summary pie chart
    const listingSummary: DashboardData["listingSummary"] = listingSummaryData
      ? [
          {
            label: "Active",
            value: listingSummaryData.activeListings,
            color: "#006266",
          },
          {
            label: "Inactive",
            value: listingSummaryData.inactiveListings,
            color: "#0072CE",
          },
          {
            label: "Pending",
            value: listingSummaryData.pendingListings,
            color: "#FFC107",
          },
          {
            label: "Flagged",
            value: listingSummaryData.flaggedListings,
            color: "#FF3E41",
          },
        ]
      : base.listingSummary;

    return {
      ...base,
      metrics,
      userManagement,
      recentActivity,
      listingSummary,
    };
  }, [cardsData, userMgmtData, activityData, listingSummaryData]);

  const handleGenerateReport = () => {
    try {
      const report = generateDynamicReport(combinedData);
      const markdown = reportToMarkdown(report);
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date()
        .toISOString()
        .replace(/[:T]/g, "-")
        .slice(0, 19);
      a.download = `health-report-${timestamp}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Report generation failed:", error);
      alert("Failed to generate report. See console for details.");
    }
  };
  const isLoading =
    cardsLoading || userMgmtLoading || activityLoading || listingSummaryLoading;

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <PageWrapper
      title="Dashboard Overview"
      subtitle="Overview of key metrics and activities"
      isPopulated={true}
      showDefaultHeader={false}
      headerComponent={
        <>
          <DashboardHeader onPrimaryButtonClick={handleGenerateReport} />
          <DashboardMetrics metrics={uiMetrics} />
        </>
      }
      emptyState={{
        iconUrl: "/svg/dashboard.svg",
        title: "Your dashboard is quiet… for now.",
        subtitle:
          "Once users start signing up, listings are added, and bookings roll in, you'll see your key platform metrics here — all in one place.",
      }}
    >
      <DashboardGrid data={combinedData} bookingBreakdown={bookingBreakdownData} />
    </PageWrapper>
  );
}
