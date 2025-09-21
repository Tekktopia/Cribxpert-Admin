import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/charts/BarChart";
import type { AnalyticsData } from "@/data/analyticsData";

interface Props {
  items: AnalyticsData["topHosts"];
}

export function TopPerformingHosts({ items }: Props) {
  return (
    <Card>
      <CardHeader className='p-6 pb-0'>
        <CardTitle className='text-base font-semibold'>
          Top 5 Performing Hosts
        </CardTitle>
        <span className='text-xs text-gray-400'>Top 5 Performing Hosts</span>
      </CardHeader>
      <CardContent className='p-6 pt-4'>
        <div className='h-44'>
          <BarChart data={items} />
        </div>
      </CardContent>
    </Card>
  );
}
