import { useMemo } from "react";
import { DashboardHeader } from "../features/dashboard/DashboardHeader";
import { DashboardMetrics } from "../features/dashboard/DashboardMetrics";
import { DashboardGrid } from "../features/dashboard/DashboardGrid";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { dashboardData } from "../data/dashboardData";
import {
  useGetDashboardCardsQuery,
  useGetUserManagementQuery,
  useGetRecentActivityQuery,
  useGetListingSummaryQuery,
} from "@/api/features/adminDashboard/adminDashboardApiSlice";
import LoadingPage from "@/components/ui/LoadingPage";

export function DashboardPage() {
  // Fetch admin dashboard data from APIs
  const { data: cardsData, isLoading: cardsLoading } = useGetDashboardCardsQuery();
  const { data: userMgmtData, isLoading: userMgmtLoading } = useGetUserManagementQuery();
  const { data: activityData, isLoading: activityLoading } = useGetRecentActivityQuery({ limit: 20 });
  const { data: listingSummaryData, isLoading: listingSummaryLoading } = useGetListingSummaryQuery();

  // Transform API data to match component expectations
  const transformedMetrics = useMemo(() => {
    if (!cardsData) return dashboardData.metrics;

    return {
      totalUsers: {
        value: cardsData.totalUsers.toString(),
        change: 0, // API doesn't provide change percentage
        changeText: "",
        details: undefined,
      },
      activeListings: {
        value: cardsData.activeListings.toString(),
        change: 0,
        changeText: "",
      },
      weeklyBookings: {
        value: cardsData.weeklyBookings.toString(),
        change: 0,
        changeText: "",
      },
      totalRevenue: dashboardData.metrics.totalRevenue, // Keep existing revenue data
    };
  }, [cardsData]);

  const transformedUserManagement = useMemo(() => {
    if (!userMgmtData) return dashboardData.userManagement;

    return [
      {
        label: "Verified",
        value: userMgmtData.verifiedUsers,
        color: "#3b82f6", // blue
      },
      {
        label: "Pending",
        value: userMgmtData.pendingUsers,
        color: "#f97316", // orange
      },
      {
        label: "Blocked",
        value: userMgmtData.blockedUsers,
        color: "#ef4444", // red
      },
    ];
  }, [userMgmtData]);

  const transformedRecentActivity = useMemo(() => {
    if (!activityData?.activities) return dashboardData.recentActivity;

    return activityData.activities.map((activity, index) => {
      // Map API activity types to component types
      let type: "user_verification" | "listing_flagged" | "payout_processed" = "user_verification";
      let title = "";
      let description = "";
      let status: "completed" | "pending" | "failed" = "completed";

      if (activity.type === "signup") {
        type = "user_verification";
        title = "User Verification Approved";
        description = activity.user?.fullName || activity.user?.email || "New user";
        status = "completed";
      } else if (activity.type === "listing_update") {
        type = "listing_flagged";
        title = "Listing Flagged For Review";
        description = activity.listing?.name || "Listing updated";
        status = "pending";
      } else if (activity.type === "booking") {
        type = "payout_processed";
        title = "Payout Processed";
        description = `${activity.user?.fullName || "User"} - $${activity.booking?.totalPrice || 0}`;
        status = activity.booking?.status === "Confirmed" ? "completed" : "pending";
      }

      // Format timestamp to relative time
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
        id: activity.user?._id || activity.listing?._id || activity.booking?._id || index.toString(),
        type,
        title,
        description,
        timestamp: timeAgo,
        status,
      };
    });
  }, [activityData]);

  const transformedListingSummary = useMemo(() => {
    if (!listingSummaryData) return dashboardData.listingSummary;

    return [
      { label: "Active", value: listingSummaryData.activeListings, color: "#006266" }, // Exact Teal from Figma
      { label: "Inactive", value: listingSummaryData.inactiveListings, color: "#0072CE" }, // Exact Blue from Figma
      { label: "Pending", value: listingSummaryData.pendingListings, color: "#FFC107" }, // Exact Amber from Figma
      { label: "Flagged", value: listingSummaryData.flaggedListings, color: "#FF3E41" }, // Exact Red from Figma
    ];
  }, [listingSummaryData]);

  // Combine transformed API data with existing mock data
  const combinedData = useMemo(() => {
    return {
      ...dashboardData,
      metrics: transformedMetrics,
      userManagement: transformedUserManagement,
      recentActivity: transformedRecentActivity,
      listingSummary: transformedListingSummary,
    };
  }, [transformedMetrics, transformedUserManagement, transformedRecentActivity, transformedListingSummary]);

  const isLoading = cardsLoading || userMgmtLoading || activityLoading || listingSummaryLoading;
  const hasData = Boolean(cardsData || userMgmtData || activityData || listingSummaryData);
  const isPopulated = !isLoading && hasData;
  

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <PageWrapper
      title='Dashboard Overview'
      subtitle='Overview of platform activity and key metrics'
      isPopulated={isPopulated}
      showDefaultHeader={false} // We use DashboardHeader instead
      headerComponent={
        <>
          <DashboardHeader />
          <DashboardMetrics metrics={combinedData.metrics} />
        </>
      }
      emptyState={{
        iconUrl: "/svg/dashboard.svg",
        title: "Your dashboard is quiet… for now.",
        subtitle:
          "Once users start signing up, listings are added, and bookings roll in, you'll see your key platform metrics here — all in one place.",
      }}
    >
      {/* Main Content */}
      <DashboardGrid data={combinedData} />
    </PageWrapper>
  );
}
