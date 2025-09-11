import React, { useState, useCallback, useRef, useEffect } from "react";
import { ListingCard } from "@/features/listingmgmt/components/ListingCard";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ListingGridProps {
  listings: ListingRecord[];
  onViewDetails: (listing: ListingRecord) => void;
  onAction: (listing: ListingRecord, action: string) => void;
  className?: string;
}

const ITEMS_PER_PAGE = 12;

export const ListingGrid = React.memo<ListingGridProps>(
  ({ listings, onViewDetails, onAction, className = "" }) => {
    const [loadedCount, setLoadedCount] = useState(ITEMS_PER_PAGE);
    const loadingRef = useRef<HTMLDivElement>(null);

    // Load more items when scrolling near the end
    const handleLoadMore = useCallback(() => {
      if (loadedCount < listings.length) {
        setLoadedCount((prev) => prev + ITEMS_PER_PAGE);
      }
    }, [loadedCount, listings.length]);

    // Intersection observer for infinite scroll
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && loadedCount < listings.length) {
            handleLoadMore();
          }
        },
        { threshold: 0.1 }
      );

      if (loadingRef.current) {
        observer.observe(loadingRef.current);
      }

      return () => observer.disconnect();
    }, [handleLoadMore, loadedCount, listings.length]);

    // Get currently displayed listings
    const displayedListings = listings.slice(
      0,
      Math.min(loadedCount, listings.length)
    );

    if (listings.length === 0) {
      return (
        <div className={`flex items-center justify-center h-64 ${className}`}>
          <div className='text-center text-gray-500'>
            <p className='text-lg'>No listings found</p>
            <p className='text-sm'>Try adjusting your filters</p>
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {displayedListings.map((listing, index) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onViewDetails={onViewDetails}
              onAction={onAction}
              index={index}
            />
          ))}
        </div>

        {/* Loading trigger and indicator */}
        {loadedCount < listings.length && (
          <div ref={loadingRef} className='flex justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600' />
          </div>
        )}
      </div>
    );
  }
);

ListingGrid.displayName = "ListingGrid";
