import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { LineChart } from "../../components/charts/LineChart";

interface MetricItem {
  label: string;
  value: number | string;
  percentChange?: number;
}

interface BookingData {
  dailyBookings: MetricItem;
  avgBookingValue: MetricItem;
  bookingsByDay: {
    day: string;
    value: number;
  }[];
  payouts: {
    label: string;
    value: string;
    status: "completed" | "pending" | "dispute";
    colorClass?: string;
  }[];
}

interface BookingFinancialMetricsProps {
  data: BookingData;
}

export function BookingFinancialMetrics({
  data,
}: BookingFinancialMetricsProps) {
  return (
    <Card className='h-full p-4'>
      <CardHeader className='p-0 pb-4'>
        <CardTitle className='text-base font-medium'>
          Booking & Financial Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4 p-0'>
        {/* Daily Bookings and Avg Booking Value */}
        <div className='space-y-2'>
          <Card className='rounded-lg px-4 py-2'>
            <p className='text-xs text-[#525866] mb-1'>Daily Bookings</p>
            <div className='flex items-center justify-between'>
              <p className='text-base font-bold'>{data.dailyBookings.value}</p>
              <span className='text-xs font-medium text-[#525866] px-2 py-1 rounded-full'>
                {data.dailyBookings.percentChange}%
              </span>
            </div>
          </Card>
          <Card className='rounded-lg px-4 py-2'>
            <p className='text-sm text-[#525866] mb-1'>Avg. Booking Value</p>
            <div className='flex items-center justify-between'>
              <p className='text-base font-bold'>
                {data.avgBookingValue.value}
              </p>
              <span className='text-xs font-medium text-[#525866] px-2 py-1 rounded-full'>
                {data.avgBookingValue.percentChange}%
              </span>
            </div>
          </Card>
        </div>

        {/* Weekly Bookings Chart */}
        <div className='mt-4'>
          <p className='text-base font-medium text-gray-800 mb-3'>Bookings</p>
          <div className='h-8 mb-2'>
            {" "}
            {/* Adjusted height to match Figma */}
            <LineChart data={data.bookingsByDay} />
          </div>
          <div className='flex justify-between mt-2'>
            {data.bookingsByDay.map((day, index) => (
              <div key={index} className='text-[8px] text-[#6b7280]'>
                {day.day}
              </div>
            ))}
          </div>
        </div>

        {/* Payouts Section */}
        <div className='space-y-4 mt-4'>
          {data.payouts.map((payout, index) => (
            <div key={index} className='flex justify-between items-center'>
              <span className='text-sm text-gray-700'>{payout.label}</span>
              <span
                className={`text-sm font-semibold ${
                  payout.status === "completed"
                    ? "text-green-500"
                    : payout.status === "pending"
                    ? "text-amber-500"
                    : "text-red-500"
                }`}
              >
                {payout.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
