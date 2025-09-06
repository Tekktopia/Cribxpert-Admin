import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  DashboardMetrics,
  User,
  Listing,
  Booking,
  ActivityItem,
  NotificationItem,
} from "../../types";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      // Add auth token here when available
      // headers.set('authorization', `Bearer ${token}`)
      return headers;
    },
  }),
  tagTypes: [
    "Metrics",
    "Users",
    "Listings",
    "Bookings",
    "Activities",
    "Notifications",
  ],
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<DashboardMetrics, void>({
      query: () => "/dashboard/metrics",
      providesTags: ["Metrics"],
    }),
    getUsers: builder.query<User[], { page?: number; status?: string }>({
      query: ({ page = 1, status } = {}) => ({
        url: "/users",
        params: { page, status },
      }),
      providesTags: ["Users"],
    }),
    getListings: builder.query<Listing[], { page?: number; status?: string }>({
      query: ({ page = 1, status } = {}) => ({
        url: "/listings",
        params: { page, status },
      }),
      providesTags: ["Listings"],
    }),
    getBookings: builder.query<Booking[], { page?: number; status?: string }>({
      query: ({ page = 1, status } = {}) => ({
        url: "/bookings",
        params: { page, status },
      }),
      providesTags: ["Bookings"],
    }),
    getRecentActivities: builder.query<ActivityItem[], void>({
      query: () => "/activities/recent",
      providesTags: ["Activities"],
    }),
    getNotifications: builder.query<NotificationItem[], void>({
      query: () => "/notifications",
      providesTags: ["Notifications"],
    }),
    updateUserStatus: builder.mutation<
      void,
      { userId: string; status: string }
    >({
      query: ({ userId, status }) => ({
        url: `/users/${userId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetUsersQuery,
  useGetListingsQuery,
  useGetBookingsQuery,
  useGetRecentActivitiesQuery,
  useGetNotificationsQuery,
  useUpdateUserStatusMutation,
} = dashboardApi;
