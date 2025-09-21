import { MetricCard } from "@/features/dashboard/MetricCard";
import { Activity, Users, Percent } from "lucide-react";
import type { AnalyticsData } from "@/data/analyticsData";

interface Props {
  metrics: AnalyticsData["metrics"];
}

export function AnalyticsMetricsCards({ metrics }: Props) {
  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      <MetricCard
        title='Daily Active Users (DAU)'
        value={metrics.dau.value}
        change={metrics.dau.change}
        icon={Activity}
        iconBgColor='bg-sky-500'
        changeText={metrics.dau.changeText}
        details='Daily Active Users (DAU)'
      />

      <MetricCard
        title='Monthly Active Users (MAU)'
        value={metrics.mau.value}
        change={metrics.mau.change}
        icon={Users}
        iconBgColor='bg-emerald-500'
        changeText={metrics.mau.changeText}
      />

      <MetricCard
        title='Guest-to-Host Ratio'
        value={metrics.guestHostRatio.value}
        change={metrics.guestHostRatio.change}
        icon={Users}
        iconBgColor='bg-amber-500'
        changeText={metrics.guestHostRatio.changeText}
      />

      <MetricCard
        title='Conversion Rate'
        value={metrics.conversionRate.value}
        change={metrics.conversionRate.change}
        icon={Percent}
        iconBgColor='bg-teal-500'
        changeText={metrics.conversionRate.changeText}
      />
    </div>
  );
}
