// src/features/dashboard/BookingOverview.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface BookingOverviewProps {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export function BookingOverview({
  total,
  pending,
  confirmed,
  completed,
  cancelled,
}: BookingOverviewProps) {
  const data = [
    { label: "Pending", value: pending, color: "#f59e0b" },
    { label: "Confirmed", value: confirmed, color: "#0e7490" },
    { label: "Completed", value: completed, color: "#16a34a" },
    { label: "Cancelled", value: cancelled, color: "#ef4444" },
  ];

  return (
    <Card className="p-5 h-full rounded-2xl">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold">
            Booking Overview
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {total.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">total bookings</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
                formatter={(value) => [Number(value).toLocaleString(), "Bookings"]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {data.map((d) => (
                  <Cell key={d.label} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
