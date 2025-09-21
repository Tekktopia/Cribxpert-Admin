import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart } from "@/components/charts/DonutChart";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import type { BookingMetricsData } from "@/data/bookingMetricsData";

interface Props {
  trends: BookingMetricsData["trends"];
  statusBreakdown: BookingMetricsData["statusBreakdown"];
}

export function BookingChartsGrid({ trends, statusBreakdown }: Props) {
  // Prepare multi-series data for the combined line chart (3 thin lines)
  const multiSeries = [
    {
      name: "Confirmed",
      color: "#0F6B6F", // teal/dark green like figma
      data: trends.map((t) => ({ x: t.day, y: t.confirmed })),
    },
    {
      name: "Cancelled",
      color: "#F59E0B", // amber/orange
      data: trends.map((t) => ({ x: t.day, y: t.cancelled })),
    },
    {
      name: "Failed",
      color: "#EF4444", // red
      data: trends.map((t) => ({ x: t.day, y: t.failed })),
    },
  ];

  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
      <Card className='lg:col-span-8'>
        <CardHeader className='p-6 pb-0'>
          <CardTitle className='text-base font-semibold'>
            Booking Trends
          </CardTitle>
          <span className='text-xs text-gray-400'>
            Daily confirmed vs cancelled bookings
          </span>
        </CardHeader>
        <CardContent className='p-6 pt-4'>
          <MultiLineChart series={multiSeries} height={260} />
        </CardContent>
      </Card>

      <Card className='lg:col-span-4'>
        <CardHeader className='p-6 pb-0'>
          <CardTitle className='text-base font-semibold'>
            Booking Trends
          </CardTitle>
          <span className='text-xs text-gray-400'>
            Daily confirmed vs cancelled bookings
          </span>
        </CardHeader>
        <CardContent className='p-6 pt-4'>
          <div className='h-56'>
            <DonutChart data={statusBreakdown} />
          </div>
          {/* Legend */}
          <div className='mt-4 space-y-2'>
            {statusBreakdown.map((s) => (
              <div
                key={s.label}
                className='flex items-center justify-between text-sm'
              >
                <div className='flex items-center space-x-2'>
                  <span
                    className='inline-block w-3 h-3 rounded-full'
                    style={{ backgroundColor: s.color }}
                  />
                  <span className='text-gray-700'>{s.label}</span>
                </div>
                <span className='text-gray-500'>{s.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
