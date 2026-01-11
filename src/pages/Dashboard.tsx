// =====================================================
// File: src/pages/Dashboard.tsx
// (Only change: move console logs into useEffect so they don't spam every render.)
// =====================================================
import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect } from "react";

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

import SecureTokenStorage from "@/utils/secureStorage";
import { mapDashboardData } from "../utils/dashboardMapper";
import type { MetricData, DashboardUIMetrics } from "../types/dashboardUi";

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

function base64UrlToString(input: string): string {
  const base64 = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(input.length / 4) * 4, "=");
  return atob(base64);
}

function tryGetUserId(): string | null {
  const auth = SecureTokenStorage.getAuthHeader?.()?.Authorization ?? "";
  const token = auth.startsWith("Bearer ")
    ? auth.slice("Bearer ".length).trim()
    : auth.trim();
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(base64UrlToString(parts[1])) as Record<string, unknown>;
    const candidate = payload.userId ?? payload.id ?? payload._id ?? payload.sub ?? payload.uid;
    return typeof candidate === "string" && candidate.trim() ? candidate : null;
  } catch {
    return null;
  }
}

function metric(value: unknown, changeText = "—", details?: string): MetricData {
  return {
    value: Number(value ?? 0),
    change: 0,
    changeText,
    details,
  };
}

function toUIMetrics(raw: any): DashboardUIMetrics {
  return {
    totalUsers: metric(raw?.totalUsers, "—", "All registered users"),
    activeListings: metric(raw?.activeListings, "—"),
    weeklyBookings: metric(raw?.weeklyBookings, "—"),
    totalRevenue: metric(raw?.totalRevenue, "—"),
  };
}

export function DashboardPage() {
  const userId = tryGetUserId();

  const {
    data: metrics,
    isLoading: metricsLoading,
    isError: metricsError,
    error: metricsApiError,
  } = useGetDashboardMetricsQuery(undefined);

  useEffect(() => {
    console.log("Metrics loading:", metricsLoading);
    console.log("Metrics error:", metricsError);
    console.log("Metrics object:", metrics);
    console.log("Metrics API error object:", metricsApiError);
  }, [metricsLoading, metricsError, metrics, metricsApiError]);

  const { data: users = [] } = useGetUsersQuery({ page: 1 });
  const { data: listings = [] } = useGetListingsQuery({ page: 1 });

  const { data: bookings = [] } = useGetBookingsQuery(
    userId ? { userId, page: 1 } : skipToken
  );

  const { data: activities = [] } = useGetRecentActivitiesQuery(undefined);

  const { data: notifications = [] } = useGetNotificationsQuery(
    userId ? { userId } : skipToken
  );

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

  const dashboardData = mapDashboardData({
    metrics,
    users: asArray(users),
    listings: asArray(listings),
    bookings: asArray(bookings),
    activities: asArray(activities),
    notifications: asArray(notifications),
  });

  const isPopulated =
    Number((metrics as any).totalUsers ?? 0) > 0 ||
    Number((metrics as any).activeListings ?? 0) > 0 ||
    Number((metrics as any).weeklyBookings ?? 0) > 0;

  const uiMetrics = toUIMetrics(metrics);

  return (
    <PageWrapper
      title="Dashboard Overview"
      subtitle="Overview of platform activity and key metrics"
      isPopulated={isPopulated}
      showDefaultHeader={false}
      headerComponent={
        <>
          <DashboardHeader />
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
      <DashboardGrid data={dashboardData} />
    </PageWrapper>
  );
}