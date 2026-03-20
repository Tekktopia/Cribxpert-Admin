import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { ListingModalHeader } from "../components/ListingModalHeader";
import { LeftColumn } from "../components/LeftColumn";
import { RightColumn } from "../components/RightColumn";
import { ExploreAreaSection } from "../components/ExploreAreaSection";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ListingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingRecord | null;
}

export function ListingDetailsModal({
  isOpen,
  onClose,
  listing,
}: ListingDetailsModalProps) {
  if (!listing || !isOpen) return null;

  // Use actual listing images if available, otherwise use the single image
  const listingImages =
    listing.listingImg && listing.listingImg.length > 0
      ? listing.listingImg.map((img) => img.fileUrl)
      : [listing.image];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        <ListingModalHeader listing={listing} onClose={onClose} />

        {/* Content */}
        <div className='p-6'>
          {/* Property Image Gallery - Full Width at Top */}
          <ImageCarousel
            images={listingImages}
            imageAlt={listing.title}
            className='mb-6'
          />
          {listing.propertyId && (
            <p className='text-base  font-semibold font-mono mb-4'>
              Property ID: <span className='font-semibold text-gray-600'>{listing.propertyId}</span>
            </p>
          )}

          {/* Main Content - Two Column Layout */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <LeftColumn listing={listing} />
            <RightColumn listing={listing} />
          </div>

          <ExploreAreaSection listing={listing} className='mt-6' />
        </div>
      </div>
    </div>
  );
}
