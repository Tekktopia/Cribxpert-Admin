// =====================================================
// File: src/store/api/dashboard.ts
// =====================================================
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

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, "");
}

function getBaseUrl(): string {
  const origin = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (!origin?.trim()) throw new Error("Missing VITE_API_URL");
  return normalizeOrigin(origin);
}

const isJson = (ct: string) =>
  ct.includes("application/json") || ct.includes("application/problem+json");

function unwrapArray<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) return resp as T[];
  if (resp && typeof resp === "object") {
    const obj = resp as Record<string, unknown>;
    for (const k of ["data", "results", "items", "rows"]) {
      const v = obj[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

const DEFAULT_METRICS: DashboardMetrics = {
  totalUsers: 0,
  activeListings: 0,
  weeklyBookings: 0,
  totalRevenue: 0,
  userGrowth: 0,
  listingGrowth: 0,
  bookingGrowth: 0,
  revenueGrowth: 0,
};

function toNumber(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") return Number(v) || 0;
  return 0;
}

function normalizeMetrics(raw: unknown): DashboardMetrics {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  const data = obj && typeof obj.data === "object" ? (obj.data as Record<string, unknown>) : obj;
  if (!data) return DEFAULT_METRICS;
  return {
    totalUsers: toNumber(data.totalUsers),
    activeListings: toNumber(data.activeListings),
    weeklyBookings: toNumber(data.weeklyBookings),
    totalRevenue: toNumber(data.totalRevenue),
    userGrowth: toNumber(data.userGrowth),
    listingGrowth: toNumber(data.listingGrowth),
    bookingGrowth: toNumber(data.bookingGrowth),
    revenueGrowth: toNumber(data.revenueGrowth),
  };
}

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      const authHeaders = SecureTokenStorage.getAuthHeader();
      if (authHeaders.Authorization) headers.set("authorization", authHeaders.Authorization);

      const csrfHeaders = CSRFProtection.getHeaders();
      for (const [k, v] of Object.entries(csrfHeaders)) headers.set(k, v);

      headers.set("Accept", "application/json");
      headers.set("X-Requested-With", "XMLHttpRequest");
      return headers;
    },
    fetchFn: async (url, options) => {
      const key = url.toString();
      if (!RateLimiter.isAllowed(key)) {
        const retryAfter = RateLimiter.getRetryAfter(key);
        throw new Error(`Rate limit exceeded. Retry after: ${retryAfter}ms`);
      }
      RateLimiter.recordRequest(key);
      return fetch(url, options);
    },
    responseHandler: async (response) => {
      const ct = response.headers.get("content-type") ?? "";
      const text = await response.text();

      if (isJson(ct)) return JSON.parse(text || "null");

      throw new Error(
        `Expected JSON, got "${ct}". Body starts: ${JSON.stringify(text.slice(0, 160))}`
      );
    },
  }),
  tagTypes: ["Metrics", "Users", "Listings", "Bookings", "Activities", "Notifications"],
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<DashboardMetrics, void>({
      query: () => "dashboard/metrics",
      transformResponse: (resp: unknown) => normalizeMetrics(resp),
      providesTags: ["Metrics"],
    }),

    getUsers: builder.query<User[], { page?: number; status?: string }>({
      query: ({ page = 1, status } = {}) => ({
        url: "user",
        params: { page, status },
      }),
      transformResponse: (resp: unknown) => unwrapArray<User>(resp),
      providesTags: ["Users"],
    }),

    getListings: builder.query<Listing[], { page?: number; status?: string }>({
      query: ({ page = 1, status } = {}) => ({
        url: "listing",
        params: { page, status },
      }),
      transformResponse: (resp: unknown) => unwrapArray<Listing>(resp),
      providesTags: ["Listings"],
    }),

    getBookings: builder.query<Booking[], { userId: string; page?: number }>({
      query: ({ userId, page = 1 }) => ({
        url: `booking/user/${userId}`,
        params: { page },
      }),
      transformResponse: (resp: unknown) => unwrapArray<Booking>(resp),
      providesTags: ["Bookings"],
    }),

    getRecentActivities: builder.query<ActivityItem[], void>({
      query: () => "activities/recent",
      transformResponse: (resp: unknown) => unwrapArray<ActivityItem>(resp),
      providesTags: ["Activities"],
    }),

    getNotifications: builder.query<NotificationItem[], { userId: string }>({
      query: ({ userId }) => `notification/user/${userId}`,
      transformResponse: (resp: unknown) => unwrapArray<NotificationItem>(resp),
      providesTags: ["Notifications"],
    }),

    // ✅ Put it back if your UI imports useUpdateUserStatusMutation
    updateUserStatus: builder.mutation<void, { userId: string; status: string }>({
      query: ({ userId, status }) => ({
        url: `user/${userId}/status`,
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
  useUpdateUserStatusMutation, // ✅ export the hook
} = dashboardApi;
