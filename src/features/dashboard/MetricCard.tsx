import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../utils/cn";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  iconBgColor: string;
  changeText: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconBgColor,
  changeText,
}: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className='relative overflow-hidden hover:shadow-md transition-shadow'>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <p className='text-sm font-medium text-gray-600'>{title}</p>
            <p className='text-3xl font-bold text-gray-900'>{value}</p>
            <div className='flex items-center space-x-2'>
              <span
                className={cn(
                  "text-xs font-medium flex items-center",
                  isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {isPositive ? "↗" : "↘"} {Math.abs(change)}%
              </span>
              <span className='text-xs text-gray-500'>{changeText}</span>
            </div>
          </div>

          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center shadow-sm",
              iconBgColor
            )}
          >
            <Icon className='w-6 h-6 text-white' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
