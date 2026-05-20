// src/features/dashboard/ListingSummary.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { BarChart } from "../../components/charts/BarChart";

interface ListingData {
  label: string;
  value: number;
  color: string;
}

interface ListingSummaryProps {
  listingData: ListingData[];
}

export function ListingSummary({ listingData }: ListingSummaryProps) {
  const total = listingData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="h-full p-5">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold">
            Listing Summary
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {total.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">total listings</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Bar chart */}
        <div className="h-44">
          <BarChart data={listingData} />
        </div>

        {/* Legend */}
        <div className="space-y-2 mt-3">
          {listingData.map((item) => {
            const pct =
              total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400">{pct}%</span>
                  <span className="text-sm font-semibold text-gray-900 w-6 text-right">
                    {item.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
