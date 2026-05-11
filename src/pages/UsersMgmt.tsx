import { useMemo } from "react";
import { UserMgmtGrid } from "../features/usermgmt/UserMgmtGrid";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { userMgmtData, type User } from "../data/userMgmtData";
import { useGetAllUsersQuery } from "@/api/features/adminUserManagement/adminUserManagementApiSlice";
import LoadingPage from "@/components/ui/LoadingPage";
import { useRealtimeRefetch } from "@/hooks/useRealtimeRefetch";

export default function UsersMgmt() {
  const { data: usersData, isLoading, error, refetch } = useGetAllUsersQuery();
  useRealtimeRefetch(['profiles'], refetch);

  // Transform API data to match User type
  const transformedUsers = useMemo(() => {
    if (!usersData?.users) return [];

    return usersData.users.map((apiUser, index): User => {
      // Format lastActive to relative time
      let lastActive = "Never";
      if (apiUser.lastActive) {
        const lastActiveDate = new Date(apiUser.lastActive);
        const now = new Date();
        const diffMs = now.getTime() - lastActiveDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) {
          lastActive = "Just now";
        } else if (diffMins < 60) {
          lastActive = `${diffMins} ${diffMins === 1 ? "min" : "mins"} ago`;
        } else if (diffHours < 24) {
          lastActive = `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
        } else if (diffDays < 7) {
          lastActive = `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
        } else {
          const diffWeeks = Math.floor(diffDays / 7);
          lastActive = `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
        }
      }

      // Generate ticket ID (using userId first 6 chars + index)
      const ticketId = `1000${String(index + 1).padStart(2, "0")}`;

      // Get initials for avatar fallback
      // const initials = apiUser.name
      //   .split(" ")
      //   .map((n) => n[0])
      //   .join("")
      //   .toUpperCase()
      //   .slice(0, 2);

      return {
        id: apiUser.userId,
        ticketId,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phoneNo || undefined,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(apiUser.name)}&background=0e7490&color=fff&size=128`,
        role: apiUser.role === "HOST" ? "Host" : "Guest",
        status: apiUser.status === "verified" ? "Verified" : apiUser.status === "pending" ? "Pending" : "Blocked",
        lastActive,
        joinDate: new Date().toISOString().split("T")[0], // Default, API doesn't provide this
        kycStatus: "completed" as const, // Default, API doesn't provide this
        totalBookings: apiUser.totalBookings,
        activeBookings: apiUser.activeBookings,
      };
    });
  }, [usersData]);

  // Combine transformed users with existing mock data structure
  const combinedData = useMemo(() => {
    return {
      ...userMgmtData,
      users: transformedUsers,
    };
  }, [transformedUsers]);

  const isPopulated = !isLoading && transformedUsers.length > 0;

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <PageWrapper
        title='User Management'
        subtitle='View, verify, and manage all registered guests and hosts'
        isPopulated={false}
        emptyState={{
          iconUrl: "/svg/users.svg",
          title: "Error loading users",
          subtitle: "There was an error loading users. Please try again later.",
        }}
      />
    );
  }

  return (
    <PageWrapper
      title='User Management'
      subtitle='View, verify, and manage all registered guests and hosts'
      isPopulated={isPopulated}
      emptyState={{
        iconUrl: "/svg/users.svg",
        title: "No users yet",
        subtitle:
          "Users will appear here once they sign up as guests or hosts.",
      }}
    >
      <UserMgmtGrid data={combinedData} />
    </PageWrapper>
  );
}
