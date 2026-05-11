import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/utils/statusBadges";
import type { BookingMetricsData } from "@/data/bookingMetricsData";

interface Props {
  rows: BookingMetricsData["recentBookings"];
}

export function RecentBookingsTable({ rows }: Props) {
  return (
    <Card>
      <CardHeader className='p-6 pb-0'>
        <CardTitle className='text-base font-semibold'>
          Recent Bookings
        </CardTitle>
        <span className='text-xs text-gray-400'>Latest booking activities</span>
      </CardHeader>
      <CardContent className='p-6 pt-4'>
        <div className='w-full overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='text-left text-gray-500'>
                <th className='py-3 font-medium'>Ticket ID</th>
                <th className='py-3 font-medium'>Property</th>
                <th className='py-3 font-medium'>Status</th>
                <th className='py-3 font-medium'>Date</th>
                <th className='py-3 font-medium'>Revenue</th>
                <th className='py-3 font-medium'>Commission</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ticketId} className='border-t border-gray-100'>
                  <td className='py-4'>{r.ticketId}</td>
                  <td className='py-4'>{r.property}</td>
                  <td className='py-4'>
                    <Badge variant={getStatusVariant(r.status, "booking")}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className='py-4'>{r.date}</td>
                  <td className='py-4'>{r.revenue}</td>
                  <td className='py-4'>{r.commission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
