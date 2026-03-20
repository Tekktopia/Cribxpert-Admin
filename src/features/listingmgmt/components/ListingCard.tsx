import React from "react";
import { Button } from "@/components/ui/button";
import { ListingImage } from "@/features/listingmgmt/components/ListingImage";
import { ListingInfo } from "@/features/listingmgmt/components/ListingInfo";
import { ListingActionButtons } from "@/features/listingmgmt/components/ListingActionButtons";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ListingCardProps {
  listing: ListingRecord;
  onViewDetails: (listing: ListingRecord) => void;
  onAction: (listing: ListingRecord, action: string) => void;
  onHostClick?: (listing: ListingRecord) => void; // add this
  index?: number;
}

export const ListingCard = React.memo<ListingCardProps>(
  ({ listing, onViewDetails, onAction, onHostClick, index = 0 }) => (
    <div
      className=''
      role='article'
      aria-labelledby={`listing-title-${listing.id}`}
    >
      <ListingImage
        src={listing.image}
        alt={listing.title}
        // Type error: ListingImage expects status to not include "approved"
        // Solution: Map "approved" to "active" for ListingImage
        status={
          listing.status === "approved"
            ? "active"
            : listing.status
        }
        priority={index < 6}
      />

      <div className='py-2 space-y-3'>
        <ListingInfo
          id={listing.id}
          title={listing.title}
          hostName={listing.host.name}
          location={listing.location}
          price={listing.price}
          basePrice={listing.basePrice}
          cleaningFee={listing.cleaningFee}
          created={listing.created}
          onHostClick={onHostClick ? () => onHostClick(listing) : undefined}
        />

        <Button
          onClick={() => onViewDetails(listing)}
          variant='outline'
          className='w-full text-primary-600 border-primary-600'
          aria-label={`View details for ${listing.title}`}
        >
          View Details
        </Button>

        <ListingActionButtons
          listing={listing}
          onAction={(action) => onAction(listing, action)}
        />
      </div>
    </div>
  )
);

ListingCard.displayName = "ListingCard";