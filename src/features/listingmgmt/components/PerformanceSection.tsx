import { InfoSection } from "@/components/layout/InfoSection";
import { Star } from "lucide-react";

interface PerformanceSectionProps {
  totalBookings?: number;
  averageRating?: number;
  reviewsCount?: number;
}

export function PerformanceSection({
  totalBookings = 12,
  averageRating = 4.8,
  reviewsCount = 10,
}: PerformanceSectionProps) {
  return (
    <InfoSection
      title='Performance'
      fields={[
        { label: "Total Bookings", value: totalBookings.toString() },
        {
          label: "Average Rating",
          value: (
            <span className='flex items-center gap-1'>
              <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
              {averageRating}
            </span>
          ),
        },
        { label: "Reviews", value: reviewsCount.toString() },
      ]}
      headerClassName='!text-lg'
      variant='gray'
    />
  );
}
