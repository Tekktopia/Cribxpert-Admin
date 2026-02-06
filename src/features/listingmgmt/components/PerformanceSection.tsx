import { InfoSection } from "@/components/layout/InfoSection";
import { Star } from "lucide-react";
import type { ListingRecord } from "@/data/listingMgmtData";

interface PerformanceSectionProps {
  listing?: ListingRecord;
}

export function PerformanceSection({
  listing,
}: PerformanceSectionProps) {
  const totalBookings = listing?.totalBookings ?? 0;
  const averageRating = listing?.averageRating ?? 0;
  const reviewCount = listing?.reviewCount ?? 0;

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
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>
          ),
        },
        { label: "Reviews", value: reviewCount.toString() },
      ]}
      headerClassName='!text-lg'
      variant='gray'
    />
  );
}
