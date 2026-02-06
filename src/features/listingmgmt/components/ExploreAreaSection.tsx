import { MapPin, ChevronRight } from "lucide-react";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ExploreAreaSectionProps {
  listing?: ListingRecord;
  className?: string;
}

export function ExploreAreaSection({
  listing,
  className = "",
}: ExploreAreaSectionProps) {
  // Construct location string for map
  const locationString = listing?.location || "";
  const hasCoordinates = listing?.latitude !== undefined && listing?.longitude !== undefined && listing.latitude !== 0 && listing.longitude !== 0;

  // Generate OpenStreetMap embed URL
  const getMapEmbedUrl = () => {
    if (hasCoordinates && listing) {
      const lat = listing.latitude!;
      const lon = listing.longitude!;
      const zoom = 15;
      // OpenStreetMap embed URL with marker
      return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;
    }
    return null;
  };

  // Generate map link for external viewing
  const getMapLink = () => {
    if (hasCoordinates && listing) {
      return `https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}&zoom=15`;
    } else if (locationString && locationString !== "Location not specified") {
      return `https://www.openstreetmap.org/search?query=${encodeURIComponent(locationString)}`;
    }
    return null;
  };

  // Get location display text
  const locationDisplay = listing?.city && listing?.state
    ? `${listing.city}, ${listing.state}`
    : listing?.location || "Location not specified";

  return (
    <div className={className}>
      <h3 className='text-lg font-semibold mb-4'>Explore The Area</h3>

      {/* Map Section - Full Width */}
      <div className='relative w-full'>
        {hasCoordinates && listing ? (
          // Show actual embedded map when coordinates are available
          <div className='w-full h-96 rounded-lg overflow-hidden border border-gray-200 shadow-sm'>
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={getMapEmbedUrl() || undefined}
              className="border-0"
              title="Location Map"
            />
          </div>
        ) : locationString && locationString !== "Location not specified" ? (
          // Show location text with map icon when we have address but no coordinates
          <div className='w-full h-64 rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4'>
            <MapPin className='w-12 h-12 text-blue-600 mb-3' />
            <p className='text-sm font-medium text-gray-900 text-center mb-1'>{locationString}</p>
            {getMapLink() && (
              <a
                href={getMapLink() || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className='text-xs text-blue-600 hover:text-blue-700 transition-colors mt-2'
              >
                Click to view in map
              </a>
            )}
          </div>
        ) : (
          // Fallback placeholder when no location data
          <div className='w-full h-64 rounded-lg border border-gray-200 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center'>
            <div className='text-center'>
              <MapPin className='w-12 h-12 text-gray-400 mx-auto mb-2' />
              <p className='text-sm text-gray-500'>Location not available</p>
            </div>
          </div>
        )}
      </div>

      {/* Location Information */}
      {locationDisplay !== "Location not specified" && getMapLink() && (
        <div className='mt-4 pt-4 border-t border-gray-200'>
          <p className='text-sm text-gray-600 mb-2'>{locationDisplay}</p>
          <a
            href={getMapLink() || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className='flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors'
          >
            <span className='text-sm'>View in map</span>
            <ChevronRight className='w-4 h-4' />
          </a>
        </div>
      )}
    </div>
  );
}
