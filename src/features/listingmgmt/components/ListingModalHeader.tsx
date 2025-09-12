import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ListingModalHeaderProps {
  listing: ListingRecord;
  onClose: () => void;
}

export function ListingModalHeader({
  listing,
  onClose,
}: ListingModalHeaderProps) {
  return (
    <div className='flex items-center justify-between p-6 border-b'>
      <h2 className='text-xl font-semibold text-gray-900'>{listing.title}</h2>
      <Badge className='bg-yellow-50 text-yellow-600 border-0 hover:bg-yellow-50 text-xs'>
        Pending
      </Badge>
      <button
        onClick={onClose}
        className='p-2 hover:bg-gray-100 rounded-full transition-colors'
      >
        <X className='w-5 h-5' />
      </button>
    </div>
  );
}
