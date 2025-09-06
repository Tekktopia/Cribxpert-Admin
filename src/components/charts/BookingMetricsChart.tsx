import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { chartColors } from "../../config/colors";

interface BookingMetricsChartProps {
  data: {
    name: string;
    bookings: number;
    revenue: number;
  }[];
}

export function BookingMetricsChart({ data }: BookingMetricsChartProps) {
  return (
    <div className='w-full h-64'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
          <XAxis
            dataKey='name'
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#666" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#666" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Line
            type='monotone'
            dataKey='bookings'
            stroke={chartColors.primary}
            strokeWidth={3}
            dot={{ fill: chartColors.primary, strokeWidth: 2, r: 5 }}
            activeDot={{ r: 6, fill: chartColors.primary }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
