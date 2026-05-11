// src/features/dashboard/MetricCard.tsx
import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../utils/cn";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  iconBgColor: string;
  changeText: string;
  details?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconBgColor,
  changeText,
  details,
}: MetricCardProps) {
  const bgColorClass = iconBgColor.replace("bg-", "bg-") + "/10";
  const textColorClass = iconBgColor.replace("bg-", "text-");
  
  const isPositive = change > 0;
  const isNegative = change < 0;
  const ArrowIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : ArrowUp;
  const changeColorClass = isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-gray-500";

  return (
    <Card className='border border-[#eeeeee]'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <p className='text-sm text-gray-500 mb-2'>{title}</p>
            <div className='flex items-center justify-between'>
              <p className='text-3xl font-bold text-gray-900 mb-1'>{value}</p>
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  bgColorClass
                )}
              >
                <Icon className={cn("w-6 h-6", textColorClass)} />
              </div>
            </div>

            {/* Details and arrow/percentage on the same line - left and right */}
            <div className='flex items-center justify-between mt-2'>
              {/* "All time bookings" text on the left */}
              {details && (
                <p className='text-xs text-gray-500'>{details}</p>
              )}
              
              {/* Arrow + percentage + changeText on the right */}
              <div className='flex items-center text-xs'>
                <ArrowIcon className={cn("w-3.5 h-3.5 mr-1", changeColorClass)} />
                <span className={cn("font-medium mr-1", changeColorClass)}>
                  {Math.abs(change)}%
                </span>
                <span className='text-gray-600'>{changeText}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}