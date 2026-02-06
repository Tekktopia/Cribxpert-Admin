import { Badge } from "@/components/ui/badge";
import { PropertyStats } from "./PropertyStats";
import type { ListingRecord } from "@/data/listingMgmtData";

interface PropertyDetailsSectionProps {
  listing: ListingRecord;
}

export function PropertyDetailsSection({
  listing,
}: PropertyDetailsSectionProps) {
  return (
    <div className='border border-[#EBEBEB]'>
      <h3 className='text-lg font-semibold py-3 px-4 bg-[#E6EFF1] mb-2'>
        Property Details
      </h3>
      <div className='space-y-4 px-4 pb-4'>
        <div className='flex items-center gap-4 py-2'>
          <span className='text-sm text-gray-600 min-w-0 flex-shrink-0'>
            Role:
          </span>
          <div className='flex items-center space-x-2 min-w-0 flex-1'>
            <Badge className='bg-pink-50 text-pink-600 border-0 hover:bg-pink-50'>
              Host
            </Badge>
          </div>
        </div>

        <PropertyStats listing={listing} />

        {/* Description */}
        {listing.description && (
          <div className='mt-4'>
            <p className='text-sm text-gray-700 leading-relaxed'>
              {listing.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
