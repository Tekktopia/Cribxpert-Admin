import { apiSlice } from "@/api/apiSlice";

// Types for admin dashboard responses
export interface DashboardCardsResponse {
  totalUsers: number;
  activeListings: number;
  weeklyBookings: number;
}

export interface UserManagementResponse {
  verifiedUsers: number;
  pendingUsers: number;
  blockedUsers: number;
}

export interface ActivityUser {
  _id: string;
  email: string;
  fullName: string;
}

export interface ActivityListing {
  _id: string;
  name: string;
}

export interface ActivityBooking {
  _id: string;
  totalPrice: number;
  status: string;
}

export interface RecentActivity {
  type: "signup" | "listing_update" | "booking";
  timestamp: string;
  user?: ActivityUser;
  listing?: ActivityListing;
  booking?: ActivityBooking;
}

export interface RecentActivityResponse {
  activities: RecentActivity[];
}

export interface RecentActivityParams {
  limit?: number;
}

export interface ListingSummaryResponse {
  activeListings: number;
  inactiveListings: number;
  pendingListings: number;
  flaggedListings: number;
}

export const adminDashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardCards: builder.query<DashboardCardsResponse, void>({
      query: () => ({
        url: "/admin-dashboard/cards",
        method: "GET",
      }),
    }),
    getUserManagement: builder.query<UserManagementResponse, void>({
      query: () => ({
        url: "/admin-dashboard/user-management",
        method: "GET",
      }),
    }),
    getRecentActivity: builder.query<RecentActivityResponse, RecentActivityParams | void>({
      query: (params) => {
        const queryParams: Record<string, string> = {};
        if (params?.limit) {
          queryParams.limit = params.limit.toString();
        }
        return {
          url: "/admin-dashboard/recent-activity",
          method: "GET",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
    }),
    getListingSummary: builder.query<ListingSummaryResponse, void>({
      query: () => ({
        url: "/admin-dashboard/listing-summary",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetDashboardCardsQuery,
  useGetUserManagementQuery,
  useGetRecentActivityQuery,
  useGetListingSummaryQuery,
} = adminDashboardApiSlice;
