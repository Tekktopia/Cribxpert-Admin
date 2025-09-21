import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart } from "@/components/charts/DonutChart";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import type { AnalyticsData } from "@/data/analyticsData";

interface Props {
  growth: AnalyticsData["growth"];
  distribution: AnalyticsData["distribution"];
}

export function AnalyticsChartsGrid({ growth, distribution }: Props) {
  const series = [
    {
      name: "Host",
      color: "#9A6200", // brown-ish like figma
      data: growth.map((g) => ({ x: g.month, y: g.host })),
    },
    {
      name: "Guest",
      color: "#0F6B6F", // teal/dark
      data: growth.map((g) => ({ x: g.month, y: g.guest })),
    },
  ];

  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
      <Card className='lg:col-span-8'>
        <CardHeader className='p-6 pb-0'>
          <CardTitle className='text-base font-semibold'>
            User Growth Trend
          </CardTitle>
          <span className='text-xs text-gray-400'>
            User registrations over last 6 months
          </span>
        </CardHeader>
        <CardContent className='p-6 pt-4'>
          <MultiLineChart series={series} height={260} />
          <div className='mt-4 flex items-center gap-6 text-sm'>
            <div className='flex items-center gap-2'>
              <span
                className='inline-block w-3 h-3 rounded-full'
                style={{ backgroundColor: "#9A6200" }}
              />
              <span className='text-gray-700'>Host</span>
            </div>
            <div className='flex items-center gap-2'>
              <span
                className='inline-block w-3 h-3 rounded-full'
                style={{ backgroundColor: "#0F6B6F" }}
              />
              <span className='text-gray-700'>Guest</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='lg:col-span-4'>
        <CardHeader className='p-6 pb-0'>
          <CardTitle className='text-base font-semibold'>
            User Distribution
          </CardTitle>
          <span className='text-xs text-gray-400'>
            Guests vs Hosts breakdown
          </span>
        </CardHeader>
        <CardContent className='p-6 pt-4'>
          <div className='h-56'>
            <DonutChart data={distribution} />
          </div>
          <div className='mt-4 space-y-2'>
            {distribution.map((d) => (
              <div
                key={d.label}
                className='flex items-center justify-between text-sm'
              >
                <div className='flex items-center space-x-2'>
                  <span
                    className='inline-block w-3 h-3 rounded-full'
                    style={{ backgroundColor: d.color }}
                  />
                  <span className='text-gray-700'>{d.label}</span>
                </div>
                <span className='text-gray-500'>{d.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
