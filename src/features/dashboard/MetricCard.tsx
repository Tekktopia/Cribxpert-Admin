// src/features/dashboard/MetricCard.tsx
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
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

// Inline color map — avoids broken dynamic Tailwind class assembly.
const COLOR_MAP: Record<string, { bg: string; fg: string }> = {
  "bg-blue-500":   { bg: "#eff6ff", fg: "#3b82f6" },
  "bg-violet-500": { bg: "#f5f3ff", fg: "#8b5cf6" },
  "bg-amber-500":  { bg: "#fffbeb", fg: "#f59e0b" },
  "bg-teal-500":   { bg: "#f0fdfa", fg: "#0d9488" },
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
  const showTrend = changeText.trim() !== "" && (isPositive || isNegative);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      {/* Icon tile + trend pill */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: colors.fg }} />
        </div>

        {showTrend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-[11px] font-semibold",
              isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
            )}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>

      {/* Big number */}
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>

      {/* Footnote */}
      {(details || (showTrend && changeText)) && (
        <p className="text-xs text-gray-400 mt-1.5 truncate">
          {details}
          {details && showTrend && changeText ? " · " : ""}
          {showTrend ? changeText : ""}
        </p>
      )}
    </div>
  );
}
