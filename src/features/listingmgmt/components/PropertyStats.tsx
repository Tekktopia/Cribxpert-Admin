import { Users, Bed, Bath, MapPin } from "lucide-react";
import type { ListingRecord } from "@/data/listingMgmtData";

interface PropertyStatsProps {
  listing: ListingRecord;
  className?: string;
}

export function PropertyStats({ listing, className = "" }: PropertyStatsProps) {
  const guestNo = listing.guestNo ?? 0;
  const bedroomNo = listing.bedroomNo ?? 0;
  const bathroomNo = listing.bathroomNo ?? 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Property Stats Row */}
      <div className='flex flex-wrap items-center gap-4 text-sm text-gray-700'>
        {guestNo > 0 && (
          <span className='flex items-center gap-2'>
            <Users className='w-5 h-5 text-gray-600' />
            <span className='font-medium'>{guestNo}</span>
            <span className='text-gray-600'>{guestNo === 1 ? "guest" : "guests"}</span>
          </span>
        )}
        {bedroomNo > 0 && (
          <span className='flex items-center gap-2'>
            <Bed className='w-5 h-5 text-gray-600' />
            <span className='font-medium'>{bedroomNo}</span>
            <span className='text-gray-600'>{bedroomNo === 1 ? "bedroom" : "bedrooms"}</span>
          </span>
        )}
        {bathroomNo > 0 && (
          <span className='flex items-center gap-2'>
            <Bath className='w-5 h-5 text-gray-600' />
            <span className='font-medium'>{bathroomNo}</span>
            <span className='text-gray-600'>{bathroomNo === 1 ? "bathroom" : "bathrooms"}</span>
          </span>
        )}
      </div>

      {/* Location Row - Separate line for better readability */}
      {listing.location && listing.location !== "Location not specified" && (
        <div className='flex items-start gap-2 pt-1 border-t border-gray-200'>
          <MapPin className='w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0' />
          <span className='text-sm text-gray-700 leading-relaxed'>{listing.location}</span>
        </div>
      )}
    </div>
  );
}
