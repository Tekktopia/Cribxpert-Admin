import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { LineChart } from "./charts/LineChart";

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
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "pending":
        return "text-amber-500";
      case "dispute":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base font-medium'>
          Booking & Financial Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Daily Bookings and Avg Booking Value */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-500'>Daily Bookings</p>
            <div className='flex items-center justify-between'>
              <p className='text-2xl font-bold'>{data.dailyBookings.value}</p>
              <span className='text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                {data.dailyBookings.percentChange}%
              </span>
            </div>
          </div>
          <div>
            <p className='text-sm text-gray-500'>Avg. Booking Value</p>
            <div className='flex items-center justify-between'>
              <p className='text-2xl font-bold'>{data.avgBookingValue.value}</p>
              <span className='text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                {data.avgBookingValue.percentChange}%
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Bookings Chart */}
        <div>
          <p className='text-sm text-gray-500 mb-2'>Bookings</p>
          <div className='h-28'>
            <LineChart data={data.bookingsByDay} />
          </div>
          <div className='flex justify-between mt-1'>
            {data.bookingsByDay.map((day, index) => (
              <div key={index} className='text-xs text-gray-500'>
                {day.day.substring(0, 3)}
              </div>
            ))}
          </div>
        </div>

        {/* Payouts Section */}
        <div className='space-y-2'>
          {data.payouts.map((payout, index) => (
            <div key={index} className='flex justify-between items-center'>
              <span className='text-sm text-gray-700'>{payout.label}</span>
              <span
                className={`text-sm font-medium ${
                  payout.colorClass || getStatusColorClass(payout.status)
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
