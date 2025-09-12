import { Users, Bed, Bath, MapPin } from "lucide-react";
import type { ListingRecord } from "@/data/listingMgmtData";

interface PropertyStatsProps {
  listing: ListingRecord;
  className?: string;
}

export function PropertyStats({ listing, className = "" }: PropertyStatsProps) {
  return (
    <div
      className={`flex items-center text-xs gap-1 text-gray-600 ${className}`}
    >
      <span className='flex items-center gap-1'>
        <Users className='w-4 h-4' /> 4 guests
      </span>
      <span className='flex items-center gap-1'>
        <Bed className='w-4 h-4' /> 2 bedrooms
      </span>
      <span className='flex items-center gap-1'>
        <Bath className='w-4 h-4' /> 2 bathrooms
      </span>
      <span className='flex items-center gap-1'>
        <MapPin className='w-4 h-4' /> {listing.location}
      </span>
    </div>
  );
}
