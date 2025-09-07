import { Users, Building, Calendar, DollarSign } from "lucide-react";
import { MetricCard } from "./MetricCard";
import type { DashboardData } from "../../data/dashboardData";

interface DashboardMetricsProps {
  metrics: DashboardData["metrics"];
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      {/* Total Users */}
      <MetricCard
        title='Total Users'
        value={metrics.totalUsers.value}
        change={metrics.totalUsers.change}
        icon={Users}
        iconBgColor='bg-blue-500'
        changeText={metrics.totalUsers.changeText}
        details={metrics.totalUsers.details}
      />

      {/* Active Listings */}
      <MetricCard
        title='Active Listings'
        value={metrics.activeListings.value}
        change={metrics.activeListings.change}
        icon={Building}
        iconBgColor='bg-teal-500'
        changeText={metrics.activeListings.changeText}
      />

      {/* Weekly Bookings */}
      <MetricCard
        title='Weekly Bookings'
        value={metrics.weeklyBookings.value}
        change={metrics.weeklyBookings.change}
        icon={Calendar}
        iconBgColor='bg-amber-500'
        changeText={metrics.weeklyBookings.changeText}
      />

      {/* Total Revenue */}
      <MetricCard
        title='Total Revenue'
        value={metrics.totalRevenue.value}
        change={metrics.totalRevenue.change}
        icon={DollarSign}
        iconBgColor='bg-green-500'
        changeText={metrics.totalRevenue.changeText}
      />
    </div>
  );
}
