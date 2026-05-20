// src/features/dashboard/DashboardMetrics.tsx
import {
  Users, Building2, CalendarCheck, Banknote, ShieldCheck, ClipboardList,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import type { DashboardUIMetrics } from "../../types/dashboardUi";

interface DashboardMetricsProps {
  metrics: DashboardUIMetrics;
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `₦${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `₦${(n / 1_000).toFixed(1)}k`
      : `₦${n.toLocaleString()}`;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      <MetricCard
        title="Total Users"
        value={metrics.totalUsers.value.toLocaleString()}
        change={metrics.totalUsers.change}
        icon={Users}
        iconBgColor="bg-blue-500"
        changeText={metrics.totalUsers.changeText}
        details="All registered accounts"
      />

      <MetricCard
        title="Admin Team"
        value={metrics.adminTeam.value.toLocaleString()}
        change={metrics.adminTeam.change}
        icon={ShieldCheck}
        iconBgColor="bg-violet-500"
        changeText={metrics.adminTeam.changeText}
        details="Admins & staff"
      />

      <MetricCard
        title="KYC Pending"
        value={metrics.kycPending.value.toLocaleString()}
        change={metrics.kycPending.change}
        icon={ClipboardList}
        iconBgColor="bg-amber-500"
        changeText={metrics.kycPending.changeText}
        details="Awaiting verification"
      />

      <MetricCard
        title="Active Listings"
        value={metrics.activeListings.value.toLocaleString()}
        change={metrics.activeListings.change}
        icon={Building2}
        iconBgColor="bg-teal-500"
        changeText={metrics.activeListings.changeText}
      />

      <MetricCard
        title="Weekly Bookings"
        value={metrics.weeklyBookings.value.toLocaleString()}
        change={metrics.weeklyBookings.change}
        icon={CalendarCheck}
        iconBgColor="bg-orange-500"
        changeText={metrics.weeklyBookings.changeText}
      />

      <MetricCard
        title="Total Revenue"
        value={fmt(metrics.totalRevenue.value)}
        change={metrics.totalRevenue.change}
        icon={Banknote}
        iconBgColor="bg-green-500"
        changeText={metrics.totalRevenue.changeText}
        details="Confirmed & released"
      />
    </div>
  );
}
