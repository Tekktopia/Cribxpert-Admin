import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookingMetricsData } from "@/data/bookingMetricsData";

interface Props {
  items: BookingMetricsData["topListings"];
}

export function TopBookedListings({ items }: Props) {
  return (
    <Card className='p-6'>
      <CardHeader className='p-0 pb-4'>
        <CardTitle className='text-base font-semibold'>
          Top 5 Most Booked Listings
        </CardTitle>
        Properties with highest booking volume
      </CardHeader>
      <CardContent>
        <ul className='divide-y divide-gray-100'>
          {items.map((item, idx) => (
            <li key={idx} className='flex items-center justify-between py-3'>
              <div className='flex items-center space-x-3'>
                <img
                  src={item.image}
                  alt={item.title}
                  className='w-10 h-10 rounded-full object-cover'
                />
                <div>
                  <p className='text-sm text-gray-800'>{item.title}</p>
                  <p className='text-xs text-gray-400'>{item.author}</p>
                </div>
              </div>
              <span className='text-xs text-gray-500'>
                {item.bookings} Bookings
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
