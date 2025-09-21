import { MetricCard } from "@/features/dashboard/MetricCard";
import { Calendar, DollarSign, FileWarning, HandCoins } from "lucide-react";
import type { BookingMetricsData } from "@/data/bookingMetricsData";

interface Props {
  metrics: BookingMetricsData["metrics"];
}

export function BookingMetricsCards({ metrics }: Props) {
  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      <MetricCard
        title='Total Bookings'
        value={metrics.totalBookings.value}
        change={metrics.totalBookings.change}
        icon={Calendar}
        iconBgColor='bg-sky-500'
        changeText={metrics.totalBookings.changeText}
        details={metrics.totalBookings.details}
      />

      <MetricCard
        title='Average Booking Value'
        value={metrics.averageValue.value}
        change={metrics.averageValue.change}
        icon={HandCoins}
        iconBgColor='bg-emerald-500'
        changeText={metrics.averageValue.changeText}
      />

      <MetricCard
        title='Pending Payouts'
        value={metrics.pendingPayouts.value}
        change={metrics.pendingPayouts.change}
        icon={DollarSign}
        iconBgColor='bg-amber-500'
        changeText={metrics.pendingPayouts.changeText}
      />

      <MetricCard
        title='Open Disputes'
        value={metrics.openDisputes.value}
        change={metrics.openDisputes.change}
        icon={FileWarning}
        iconBgColor='bg-teal-500'
        changeText={metrics.openDisputes.changeText}
      />
    </div>
  );
}
