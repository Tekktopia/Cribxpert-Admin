import type { LucideIcon } from "lucide-react";
import { ArrowUp } from "lucide-react";
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
  // Create the background color by using the 50 shade variant
  const bgColorClass = iconBgColor.replace("bg-", "bg-") + "/10"; // Using opacity instead of -50 variant
  const textColorClass = iconBgColor.replace("bg-", "text-");

  return (
    <Card className='border border-gray-100 shadow-sm transition-shadow duration-200'>
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

            <div className='flex items-center text-xs'>
              {details && <p className='text-gray-500 text-[10px]'>{details}</p>}
              <ArrowUp className='w-3.5 h-3.5 text-green-500 ' />
              <span className='font-medium text-green-500'>
                {Math.abs(change)}%
              </span>
              <span className='text-gray-600 ml-1.5'>{changeText}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
