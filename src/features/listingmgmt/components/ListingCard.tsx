import React, { useState } from "react";
import { MapPin, Star, Users, BedDouble, Bath, User as UserIcon, CalendarDays, PencilLine } from "lucide-react";
import { ListingActionButtons } from "@/features/listingmgmt/components/ListingActionButtons";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ListingCardProps {
  listing: ListingRecord;
  onViewDetails: (listing: ListingRecord) => void;
  onAction: (listing: ListingRecord, action: string) => void;
  onHostClick?: (listing: ListingRecord) => void;
  index?: number;
}

// Status pill config — mirrors the user-side My-Listing chips.
const STATUS_PILL: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
  flagged: "bg-orange-100 text-orange-700",
  hidden: "bg-gray-200 text-gray-700",
  draft: "bg-gray-100 text-gray-500",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  rejected: "Rejected",
  flagged: "Flagged",
  hidden: "Hidden",
  draft: "Draft",
};

export const ListingCard = React.memo<ListingCardProps>(
  ({ listing, onViewDetails, onAction, onHostClick, index = 0 }) => {
    const [imgError, setImgError] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    const imgSrc =
      imgError
        ? "/images/complaint1.jpg"
        : listing.listingImg?.[0]?.fileUrl || listing.image || "/images/complaint1.jpg";

    return (
      <div
        role="article"
        aria-labelledby={`listing-title-${listing.id}`}
        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col"
      >
        {/* Image */}
        <button
          type="button"
          onClick={() => onViewDetails(listing)}
          className="relative aspect-[4/3] overflow-hidden bg-gray-100 text-left"
        >
          <img
            src={imgSrc}
            alt={listing.title}
            loading={index < 6 ? "eager" : "lazy"}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(true);
            }}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {!imgLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

          {/* Status pill — if the listing has an editSnapshot it's a host-edited
              pending listing; show a secondary "Edited" badge so admins can
              distinguish it from a fresh submission on the same Pending tab. */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                STATUS_PILL[listing.status] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {STATUS_LABEL[listing.status] ?? listing.status}
            </span>
            {listing.editSnapshot && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
                <PencilLine className="w-3 h-3" />
                Edited
              </span>
            )}
          </div>

          {/* Rating chip */}
          {listing.averageRating != null && listing.averageRating > 0 && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-semibold text-gray-800">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {listing.averageRating.toFixed(1)}
            </span>
          )}
        </button>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3
            id={`listing-title-${listing.id}`}
            className="font-semibold text-gray-900 text-base leading-tight line-clamp-1"
          >
            {listing.title}
          </h3>

          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{listing.location}</span>
          </div>

          {/* Host */}
          <button
            type="button"
            onClick={() => onHostClick?.(listing)}
            className="flex items-center gap-1.5 text-sm text-primary-600 hover:underline mt-2 w-fit"
          >
            <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{listing.host.name}</span>
          </button>

          {/* Meta row */}
          {(listing.guestNo != null || listing.bedroomNo != null || listing.bathroomNo != null) && (
            <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-500">
              {listing.guestNo != null && (
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{listing.guestNo}</span>
              )}
              {listing.bedroomNo != null && (
                <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{listing.bedroomNo}</span>
              )}
              {listing.bathroomNo != null && (
                <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{listing.bathroomNo}</span>
              )}
            </div>
          )}

          {/* Price + bookings */}
          <div className="flex items-end justify-between mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-900">{listing.price}</span>
            </div>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {listing.totalBookings ?? 0} booking{(listing.totalBookings ?? 0) === 1 ? "" : "s"}
            </span>
          </div>

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
            <button
              onClick={() => onViewDetails(listing)}
              className="w-full py-2 rounded-lg border border-primary-600 text-primary-600 text-sm font-semibold hover:bg-primary-50 transition-colors"
              aria-label={`View details for ${listing.title}`}
            >
              View Details
            </button>
            <ListingActionButtons
              listing={listing}
              onAction={(action) => onAction(listing, action)}
            />
          </div>
        </div>
      </div>
    );
  }
);

ListingCard.displayName = "ListingCard";
