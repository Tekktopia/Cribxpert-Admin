// src/features/dashboard/MetricCard.tsx
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
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

// Inline color map — avoids broken dynamic Tailwind class assembly
const COLOR_MAP: Record<string, { bg: string; fg: string }> = {
  "bg-blue-500":   { bg: "#eff6ff", fg: "#3b82f6" },
  "bg-violet-500": { bg: "#f5f3ff", fg: "#8b5cf6" },
  "bg-amber-500":  { bg: "#fffbeb", fg: "#f59e0b" },
  "bg-teal-500":   { bg: "#f0fdfa", fg: "#14b8a6" },
  "bg-orange-500": { bg: "#fff7ed", fg: "#f97316" },
  "bg-green-500":  { bg: "#f0fdf4", fg: "#22c55e" },
};

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconBgColor,
  changeText,
  details,
}: MetricCardProps) {
  const colors = COLOR_MAP[iconBgColor] ?? { bg: "#f3f4f6", fg: "#6b7280" };

  const isPositive = change > 0;
  const isNegative = change < 0;
  // Only render the trend row when there's something meaningful to show
  const showTrend = changeText.trim() !== "" && (isPositive || isNegative);

  return (
    <Card className="border border-[#eeeeee]">
      <CardContent className="p-4">
        {/* Title + icon */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500 font-medium leading-tight">{title}</p>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: colors.bg }}
          >
            <Icon className="w-5 h-5" style={{ color: colors.fg }} />
          </div>
        </div>

        {/* Big number */}
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-2 min-h-[18px]">
          {details && (
            <p className="text-xs text-gray-400 truncate">{details}</p>
          )}

          {showTrend && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-xs ml-auto flex-shrink-0",
                isPositive ? "text-emerald-600" : "text-red-500"
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span className="font-semibold">{Math.abs(change)}%</span>
              <span className="text-gray-400 ml-1">{changeText}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
