import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
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
  // Create the background color by using the 50 shade variant
  const bgColorClass = iconBgColor.replace("bg-", "bg-") + "/10"; // Using opacity instead of -50 variant
  const textColorClass = iconBgColor.replace("bg-", "text-");

  return (
    <Card className='border border-gray-100 shadow-sm'>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <p className='text-xs text-gray-500 mb-2'>{title}</p>
            <p className='text-xl font-bold text-gray-900 mb-4'>{value}</p>
            <div className='flex items-center'>
              <TrendingUp className='w-3.5 h-3.5 text-green-500 mr-1' />
              <span className='text-sm font-medium text-green-500'>
                {Math.abs(change)}%
              </span>
              <span className='text-xs text-gray-400 ml-1.5'>{changeText}</span>
            </div>
          </div>

          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              bgColorClass
            )}
          >
            <Icon className={cn("w-6 h-6", textColorClass)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
