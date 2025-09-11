import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import SecureTokenStorage from "@/utils/secureStorage";
import CSRFProtection from "@/utils/csrfProtection";
import RateLimiter from "@/utils/rateLimiter";
import type {
  DashboardMetrics,
  User,
  Listing,
  Booking,
  ActivityItem,
  NotificationItem,
} from "@/types";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      // Get auth headers from secure token storage
      const authHeaders = SecureTokenStorage.getAuthHeader();

      // Add authorization header if token exists
      if (authHeaders.Authorization) {
        headers.set("authorization", authHeaders.Authorization);
      }

      // Add CSRF protection headers
      const csrfHeaders = CSRFProtection.getHeaders();
      Object.entries(csrfHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      // Add other security headers
      headers.set("Content-Type", "application/json");
      headers.set("X-Requested-With", "XMLHttpRequest");

      return headers;
    },
    fetchFn: async (url, options) => {
      // Apply rate limiting
      const rateLimitKey = url.toString();

      if (!RateLimiter.isAllowed(rateLimitKey)) {
        const retryAfter = RateLimiter.getRetryAfter(rateLimitKey);
        throw new Error(`Rate limit exceeded. Retry after: ${retryAfter}ms`);
      }

      RateLimiter.recordRequest(rateLimitKey);

      // Use standard fetch with security enhancements
      return fetch(url, options);
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
