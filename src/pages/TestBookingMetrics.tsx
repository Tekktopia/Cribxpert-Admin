// src/pages/admin/TestBookingMetrics.tsx
import { useGetBookingMetricsQuery } from "@/api/features/adminBookingMetrics/bookingMetricsApiSlice";
import { MetricCard } from "@/features/dashboard/MetricCard";
import { Calendar } from "lucide-react";

export default function TestBookingMetrics() {
  const { data, isLoading, error } = useGetBookingMetricsQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {JSON.stringify(error)}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Booking Metrics</h1>
      <div className="w-96">
        <MetricCard
          title="Total Bookings"
          value={data?.totalBookings?.value || 0}
          change={data?.totalBookings?.change || 0}
          icon={Calendar}
          iconBgColor="bg-sky-500"
          changeText={data?.totalBookings?.changeText || "this week"}
          details={data?.totalBookings?.details}
        />
      </div>
    </div>
  );
}