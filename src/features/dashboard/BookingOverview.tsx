// src/features/dashboard/BookingOverview.tsx
import { CalendarCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface BookingOverviewProps {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

const ROWS = [
  {
    label: "Pending",
    key: "pending" as const,
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  {
    label: "Confirmed",
    key: "confirmed" as const,
    icon: CalendarCheck,
    bg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  {
    label: "Completed",
    key: "completed" as const,
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  {
    label: "Cancelled",
    key: "cancelled" as const,
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-700",
  },
];

export function BookingOverview({
  total,
  pending,
  confirmed,
  completed,
  cancelled,
}: BookingOverviewProps) {
  const values = { pending, confirmed, completed, cancelled };

  return (
    <Card className="p-4">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Booking Overview
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">All-time totals</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {total.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">total</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-2">
        {ROWS.map(({ label, key, icon: Icon, bg, text }) => (
          <div
            key={label}
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${bg}`}
          >
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${text}`} />
              <span className={`text-sm font-medium ${text}`}>{label}</span>
            </div>
            <span className={`text-sm font-bold ${text}`}>
              {values[key].toLocaleString()}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
