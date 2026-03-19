import React, { useState, useCallback, useRef, useEffect } from "react";
import { ListingCard } from "@/features/listingmgmt/components/ListingCard";
import { UserDetailsDrawer } from "@/features/usermgmt/UserDetailsDrawer";
import type { ListingRecord } from "@/data/listingMgmtData";
import type { User } from "@/data/userMgmtData";

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

    // Host profile drawer state
    const [drawerUser, setDrawerUser] = useState<User | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleHostClick = useCallback((listing: ListingRecord) => {
      const hostUser: User = {
        id: listing.id,
        name: listing.host.name,
        email: listing.host.email ?? "",
        avatar: listing.host.avatar ?? "",
        role: "Host",
        status: "Verified",
        phone: "",
        dateJoined: "",
        lastActive: "",
        totalBookings: 0,
        activeBookings: 0,
        ticketId: "",
        joinDate: "",
        kycStatus: "pending",
      };
      setDrawerUser(hostUser);
      setIsDrawerOpen(true);
    }, []);
    const handleLoadMore = useCallback(() => {
      if (loadedCount < listings.length) {
        setLoadedCount((prev) => prev + ITEMS_PER_PAGE);
      }
    }, [loadedCount, listings.length]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && loadedCount < listings.length) {
            handleLoadMore();
          }
        },
        { threshold: 0.1 }
      );
      if (loadingRef.current) observer.observe(loadingRef.current);
      return () => observer.disconnect();
    }, [handleLoadMore, loadedCount, listings.length]);

    const displayedListings = listings.slice(0, Math.min(loadedCount, listings.length));

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
      <>
        <div className={className}>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {displayedListings.map((listing, index) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onViewDetails={onViewDetails}
                onAction={onAction}
                onHostClick={handleHostClick}
                index={index}
              />
            ))}
          </div>

          {loadedCount < listings.length && (
            <div ref={loadingRef} className='flex justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600' />
            </div>
          )}
        </div>

        {/* Host Profile Drawer */}
        <UserDetailsDrawer
          user={drawerUser}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      </>
    );
  }
);

ListingGrid.displayName = "ListingGrid";